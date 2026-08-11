<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class ImportSqliteDatabase extends Command
{
    protected $signature = 'db:import-sqlite
        {source=database/database.sqlite : SQLite database path, relative to the backend root}
        {--force : Replace data in non-empty target tables}';

    protected $description = 'Import the legacy Laravel SQLite data into the configured MySQL database';

    /**
     * Tables are ordered so referenced records are inserted before dependants.
     * The target migrations table is deliberately never imported.
     *
     * @var list<string>
     */
    private const TABLES = [
        'users',
        'password_reset_tokens',
        'sessions',
        'cache',
        'cache_locks',
        'jobs',
        'job_batches',
        'failed_jobs',
        'personal_access_tokens',
        'categories',
        'products',
        'product_variants',
        'attributes',
        'attribute_values',
        'category_attribute',
        'product_attribute_values',
        'product_relations',
        'reviews',
        'carts',
        'wishlists',
        'cart_items',
        'discount_codes',
        'orders',
        'order_items',
        'payments',
        'webhook_events',
        'discount_usages',
        'blog_posts',
        'blog_post_product',
        'newsletter_subscribers',
        'contact_messages',
        'site_settings',
        'media',
    ];

    public function handle(): int
    {
        $target = DB::connection();

        if ($target->getDriverName() !== 'mysql') {
            $this->components->error('The target connection must be MySQL.');

            return self::FAILURE;
        }

        $sourcePath = $this->sourcePath((string) $this->argument('source'));
        if (! is_file($sourcePath)) {
            $this->components->error("SQLite source not found: {$sourcePath}");

            return self::FAILURE;
        }

        Config::set('database.connections.sqlite_import', [
            'driver' => 'sqlite',
            'database' => $sourcePath,
            'prefix' => '',
            'foreign_key_constraints' => true,
        ]);
        DB::purge('sqlite_import');
        $source = DB::connection('sqlite_import');

        $tables = array_values(array_filter(
            self::TABLES,
            fn (string $table): bool => Schema::connection('sqlite_import')->hasTable($table)
                && Schema::connection($target->getName())->hasTable($table),
        ));

        $nonEmpty = array_values(array_filter(
            $tables,
            fn (string $table): bool => $target->table($table)->exists(),
        ));

        if ($nonEmpty !== [] && ! $this->option('force')) {
            $this->components->error('Import refused because target tables contain data: '.implode(', ', $nonEmpty));
            $this->line('Use --force only after independently confirming the target database is disposable.');

            return self::FAILURE;
        }

        try {
            $target->transaction(function () use ($source, $target, $tables): void {
                $target->statement('SET FOREIGN_KEY_CHECKS=0');

                try {
                    if ($this->option('force')) {
                        foreach (array_reverse($tables) as $table) {
                            $target->table($table)->delete();
                        }
                    }

                    foreach ($tables as $table) {
                        $this->copyTable($source, $target, $table);
                    }
                } finally {
                    $target->statement('SET FOREIGN_KEY_CHECKS=1');
                }
            });
        } catch (Throwable $exception) {
            $this->components->error('Import failed and was rolled back: '.$exception->getMessage());

            return self::FAILURE;
        } finally {
            DB::disconnect('sqlite_import');
        }

        $this->components->info(sprintf(
            'Imported %d tables from SQLite into MySQL database %s.',
            count($tables),
            $target->getDatabaseName(),
        ));

        return self::SUCCESS;
    }

    private function copyTable(
        ConnectionInterface $source,
        ConnectionInterface $target,
        string $table,
    ): void {
        $rows = $source->table($table)->get()->map(
            fn (object $row): array => (array) $row,
        );

        foreach ($rows->chunk(250) as $chunk) {
            $target->table($table)->insert($chunk->all());
        }

        $this->line(sprintf('%-28s %d rows', $table, $rows->count()));
    }

    private function sourcePath(string $source): string
    {
        if (preg_match('/^(?:[A-Za-z]:[\\\\\/]|[\\\\\/])/', $source) === 1) {
            return $source;
        }

        return base_path($source);
    }
}

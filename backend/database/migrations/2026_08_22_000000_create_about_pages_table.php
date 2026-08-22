<?php

use App\Models\AboutPage;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('about_pages', function (Blueprint $table): void {
            $table->id();
            $table->json('title');
            $table->json('paragraph_1');
            $table->json('paragraph_2');
            $table->json('feature_1_title');
            $table->json('feature_1_description');
            $table->json('feature_2_title');
            $table->json('feature_2_description');
            $table->json('feature_3_title');
            $table->json('feature_3_description');
            $table->timestamps();
        });

        DB::table('about_pages')->insert([
            ...collect(AboutPage::defaultContent())
                ->map(fn (array $translations): string => json_encode($translations, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES))
                ->all(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('about_pages');
    }
};

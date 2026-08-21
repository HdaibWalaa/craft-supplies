<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->string('currency', 3)->default('JOD')->change();
        });

        Schema::table('payments', function (Blueprint $table): void {
            $table->string('currency', 3)->default('JOD')->change();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->string('currency', 3)->default('USD')->change();
        });

        Schema::table('payments', function (Blueprint $table): void {
            $table->string('currency', 3)->default('USD')->change();
        });
    }
};

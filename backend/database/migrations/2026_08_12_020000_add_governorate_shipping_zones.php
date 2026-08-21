<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_zones', function (Blueprint $table): void {
            $table->id(); $table->json('name'); $table->string('slug')->unique();
            $table->boolean('is_active')->default(true)->index(); $table->unsignedInteger('sort_order')->default(0)->index(); $table->timestamps();
        });
        Schema::create('shipping_zone_governorates', function (Blueprint $table): void {
            $table->id(); $table->foreignId('shipping_zone_id')->constrained()->cascadeOnDelete();
            $table->string('governorate', 30)->unique(); $table->timestamps();
        });
        Schema::create('shipping_method_zone_rates', function (Blueprint $table): void {
            $table->id(); $table->foreignId('shipping_method_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shipping_zone_id')->constrained()->cascadeOnDelete(); $table->decimal('price', 12, 2);
            $table->unsignedSmallInteger('estimated_days_min'); $table->unsignedSmallInteger('estimated_days_max');
            $table->boolean('is_active')->default(true)->index(); $table->boolean('is_default')->default(false)->index(); $table->timestamps();
            $table->unique(['shipping_method_id', 'shipping_zone_id'], 'method_zone_rate_unique');
        });

        $now = now();
        $ammanId = DB::table('shipping_zones')->insertGetId(['name' => json_encode(['ar' => 'عمّان', 'en' => 'Amman'], JSON_UNESCAPED_UNICODE), 'slug' => 'amman', 'is_active' => true, 'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now]);
        $outsideId = DB::table('shipping_zones')->insertGetId(['name' => json_encode(['ar' => 'خارج عمّان', 'en' => 'Outside Amman'], JSON_UNESCAPED_UNICODE), 'slug' => 'outside-amman', 'is_active' => true, 'sort_order' => 2, 'created_at' => $now, 'updated_at' => $now]);
        foreach (['amman'] as $code) DB::table('shipping_zone_governorates')->insert(['shipping_zone_id' => $ammanId, 'governorate' => $code, 'created_at' => $now, 'updated_at' => $now]);
        foreach (['irbid', 'zarqa', 'balqa', 'mafraq', 'jerash', 'ajloun', 'madaba', 'karak', 'tafilah', 'maan', 'aqaba'] as $code) DB::table('shipping_zone_governorates')->insert(['shipping_zone_id' => $outsideId, 'governorate' => $code, 'created_at' => $now, 'updated_at' => $now]);
        foreach (DB::table('shipping_methods')->get() as $method) {
            foreach ([$ammanId, $outsideId] as $zoneId) DB::table('shipping_method_zone_rates')->insert(['shipping_method_id' => $method->id, 'shipping_zone_id' => $zoneId, 'price' => $method->price, 'estimated_days_min' => $method->estimated_days_min, 'estimated_days_max' => $method->estimated_days_max, 'is_active' => true, 'is_default' => $method->sort_order === 1, 'created_at' => $now, 'updated_at' => $now]);
        }
        Schema::table('orders', function (Blueprint $table): void {
            $table->foreignId('shipping_zone_id')->nullable()->after('shipping_method_id')->constrained()->nullOnDelete();
            $table->string('shipping_zone_name')->nullable()->after('shipping_zone_id');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void { $table->dropConstrainedForeignId('shipping_zone_id'); $table->dropColumn('shipping_zone_name'); });
        Schema::dropIfExists('shipping_method_zone_rates'); Schema::dropIfExists('shipping_zone_governorates'); Schema::dropIfExists('shipping_zones');
    }
};

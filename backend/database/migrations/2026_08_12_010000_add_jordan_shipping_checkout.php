<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_methods', function (Blueprint $table): void {
            $table->id();
            $table->json('name');
            $table->json('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->unsignedSmallInteger('estimated_days_min');
            $table->unsignedSmallInteger('estimated_days_max');
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
        });

        DB::table('shipping_methods')->insert([
            ['name' => json_encode(['ar' => 'التوصيل العادي', 'en' => 'Standard Delivery'], JSON_UNESCAPED_UNICODE), 'description' => json_encode(['ar' => 'التوصيل خلال 3 - 7 أيام عمل', 'en' => 'Delivery within 3-7 business days'], JSON_UNESCAPED_UNICODE), 'price' => 6.99, 'estimated_days_min' => 3, 'estimated_days_max' => 7, 'is_active' => true, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => json_encode(['ar' => 'التوصيل السريع', 'en' => 'Express Delivery'], JSON_UNESCAPED_UNICODE), 'description' => json_encode(['ar' => 'التوصيل خلال 1 - 2 يوم عمل', 'en' => 'Delivery within 1-2 business days'], JSON_UNESCAPED_UNICODE), 'price' => 18.99, 'estimated_days_min' => 1, 'estimated_days_max' => 2, 'is_active' => true, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
        ]);

        Schema::table('addresses', function (Blueprint $table): void {
            $table->string('full_name')->nullable()->after('user_id');
            $table->string('governorate', 30)->nullable()->after('phone');
            $table->text('address')->nullable()->after('governorate');
            $table->string('first_name')->nullable()->change();
            $table->string('last_name')->nullable()->change();
            $table->string('line_1')->nullable()->change();
            $table->string('city')->nullable()->change();
            $table->char('country_code', 2)->default('JO')->change();
        });

        Schema::table('orders', function (Blueprint $table): void {
            $table->foreignId('shipping_method_id')->nullable()->after('shipping_method')->constrained()->nullOnDelete();
            $table->string('shipping_method_name')->nullable()->after('shipping_method_id');
            $table->unsignedSmallInteger('shipping_estimated_days_min')->nullable()->after('shipping_method_name');
            $table->unsignedSmallInteger('shipping_estimated_days_max')->nullable()->after('shipping_estimated_days_min');
            $table->string('email')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('shipping_method_id');
            $table->dropColumn(['shipping_method_name', 'shipping_estimated_days_min', 'shipping_estimated_days_max']);
            $table->string('email')->nullable(false)->change();
        });
        Schema::table('addresses', function (Blueprint $table): void {
            $table->dropColumn(['full_name', 'governorate', 'address']);
        });
        Schema::dropIfExists('shipping_methods');
    }
};

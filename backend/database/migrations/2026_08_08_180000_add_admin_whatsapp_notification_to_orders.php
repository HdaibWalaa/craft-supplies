<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->timestamp('admin_whatsapp_notified_at')->nullable()->after('paid_at')->index();
            $table->string('admin_whatsapp_message_id')->nullable()->after('admin_whatsapp_notified_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropIndex(['admin_whatsapp_notified_at']);
            $table->dropColumn(['admin_whatsapp_notified_at', 'admin_whatsapp_message_id']);
        });
    }
};

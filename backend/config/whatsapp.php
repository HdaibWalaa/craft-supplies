<?php

return [
    'enabled' => (bool) env('WHATSAPP_ENABLED', false),
    'api_version' => env('WHATSAPP_API_VERSION'),
    'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
    'access_token' => env('WHATSAPP_ACCESS_TOKEN'),
    'admin_number' => env('WHATSAPP_ADMIN_NUMBER'),
    'message_mode' => env('WHATSAPP_MESSAGE_MODE', 'template'),
    'order_template' => env('WHATSAPP_ORDER_TEMPLATE', 'admin_new_order_ar'),
    'template_language' => env('WHATSAPP_ORDER_TEMPLATE_LANGUAGE', 'ar'),
    'order_item_limit' => (int) env('WHATSAPP_ORDER_ITEM_LIMIT', 8),
    'timeout' => (int) env('WHATSAPP_TIMEOUT', 10),
];

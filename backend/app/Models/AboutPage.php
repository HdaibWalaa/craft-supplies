<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class AboutPage extends Model
{
    use HasTranslations;

    protected $fillable = [
        'title',
        'paragraph_1',
        'paragraph_2',
        'feature_1_title',
        'feature_1_description',
        'feature_2_title',
        'feature_2_description',
        'feature_3_title',
        'feature_3_description',
    ];

    public array $translatable = [
        'title',
        'paragraph_1',
        'paragraph_2',
        'feature_1_title',
        'feature_1_description',
        'feature_2_title',
        'feature_2_description',
        'feature_3_title',
        'feature_3_description',
    ];

    public static function singleton(): self
    {
        return self::query()->firstOrCreate([], self::defaultContent());
    }

    public static function defaultContent(): array
    {
        return [
            'title' => ['en' => 'About Craft Supplies', 'ar' => 'عن Craft Supplies'],
            'paragraph_1' => [
                'en' => 'Craft Supplies started the way most craft supply shelves do — with too much leftover soy wax, a drawer of half-used mica powders, and a hunch that other makers were dealing with the exact same clutter. We built the shop we wished existed: one place for candle, resin, soap, mold, fragrance, concrete, and wood supplies, without hunting across a dozen different stores.',
                'ar' => 'بدأت Craft Supplies كما تبدأ معظم زوايا مستلزمات الحرف، بفائض من شمع الصويا ودرج مليء بمساحيق الميكا المستخدمة جزئيًا، وشعور بأن صناعًا آخرين يواجهون الفوضى نفسها. لذلك أنشأنا المتجر الذي تمنينا وجوده: مكان واحد لمستلزمات الشموع والراتنج والصابون والقوالب والعطور والخرسانة والأعمال الخشبية، دون الحاجة للبحث في متاجر متعددة.',
            ],
            'paragraph_2' => [
                'en' => 'Every material we carry gets tested in our own workshop first. If a wax doesn’t throw scent well, or a mold releases badly, it doesn’t make it onto the shelf — whether you’re pouring your first candle or running a small batch business, we want the supplies to be the reliable part of the process.',
                'ar' => 'نختبر كل مادة نوفرها أولًا في ورشتنا. فإذا كان الشمع لا ينشر العطر جيدًا، أو كان القالب لا يحرر القطعة بسهولة، فلن نعرضه للبيع. سواء كنت تصنع شمعتك الأولى أو تدير مشروعًا صغيرًا، نريد أن تكون المستلزمات الجزء الموثوق في عملك.',
            ],
            'feature_1_title' => ['en' => 'Small Team, Big Care', 'ar' => 'فريق صغير، اهتمام كبير'],
            'feature_1_description' => [
                'en' => 'Every order is packed by hand, with care for fragile items.',
                'ar' => 'نجهز كل طلب يدويًا بعناية خاصة لضمان وصول المنتجات بأفضل حال.',
            ],
            'feature_2_title' => ['en' => 'For Every Level', 'ar' => 'لكل المستويات'],
            'feature_2_description' => [
                'en' => 'From first-timers to small businesses stocking up.',
                'ar' => 'من المبتدئين وحتى المشاريع الصغيرة التي تبحث عن مستلزماتها.',
            ],
            'feature_3_title' => ['en' => 'Maker-Tested', 'ar' => 'مختبر عمليًا'],
            'feature_3_description' => [
                'en' => 'Every material is tested in-house before we sell it.',
                'ar' => 'نختبر كل مادة بأنفسنا قبل عرضها للبيع.',
            ],
        ];
    }
}

<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Filament\Pages\AboutPageSettings;
use App\Models\AboutPage;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class AboutPageContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_about_content_is_returned_in_the_requested_locale(): void
    {
        $this->assertDatabaseCount('about_pages', 1);

        $this->withHeader('Accept-Language', 'en')
            ->getJson('/api/v1/about-page')
            ->assertOk()
            ->assertJsonPath('data.title', 'About Craft Supplies')
            ->assertJsonPath('data.features.0.title', 'Small Team, Big Care')
            ->assertJsonPath('data.features.1.title', 'For Every Level')
            ->assertJsonPath('data.features.2.title', 'Maker-Tested');

        $this->withHeader('Accept-Language', 'ar')
            ->getJson('/api/v1/about-page')
            ->assertOk()
            ->assertJsonPath('data.title', 'عن Craft Supplies')
            ->assertJsonPath('data.features.0.title', 'فريق صغير، اهتمام كبير')
            ->assertJsonPath('data.features.1.title', 'لكل المستويات')
            ->assertJsonPath('data.features.2.title', 'مختبر عمليًا');
    }

    public function test_filament_persists_both_locales_without_overwriting_either_translation(): void
    {
        Filament::setCurrentPanel(Filament::getPanel('admin'));
        $this->actingAs(User::factory()->create([
            'role' => UserRole::Admin,
            'is_active' => true,
        ]));

        Livewire::test(AboutPageSettings::class)
            ->assertSchemaStateSet([
                'title.en' => 'About Craft Supplies',
                'title.ar' => 'عن Craft Supplies',
            ])
            ->fillForm([
                'title.en' => 'Our English Story',
                'title.ar' => 'قصتنا العربية',
                'feature_1_title.en' => 'English feature',
                'feature_1_title.ar' => 'ميزة عربية',
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $about = AboutPage::query()->firstOrFail();
        $this->assertSame('Our English Story', $about->getTranslation('title', 'en'));
        $this->assertSame('قصتنا العربية', $about->getTranslation('title', 'ar'));
        $this->assertSame('English feature', $about->getTranslation('feature_1_title', 'en'));
        $this->assertSame('ميزة عربية', $about->getTranslation('feature_1_title', 'ar'));

        Livewire::test(AboutPageSettings::class)
            ->assertSchemaStateSet([
                'title.en' => 'Our English Story',
                'title.ar' => 'قصتنا العربية',
            ]);
    }
}

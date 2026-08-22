<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Filament\Pages\HomepageSettings;
use App\Models\SiteSetting;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

class HomepageHeroStyleTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_api_defaults_unknown_and_missing_styles_to_hero_one(): void
    {
        $this->withHeader('Accept-Language', 'ar')->getJson('/api/v1/homepage-settings')
            ->assertOk()
            ->assertJsonPath('data.appearance.theme', 'theme_1')
            ->assertJsonPath('data.hero_style', 'hero_1')
            ->assertJsonPath('data.hero_2.media', null)
            ->assertJsonPath('data.contact.email', 'info@craftsuppliesjo.com')
            ->assertJsonPath('data.contact.address', 'عمّان - الأردن')
            ->assertJsonPath('data.contact.support_hours', '24/7')
            ->assertJsonPath('data.contact.whatsapp_display', '00962790283438')
            ->assertJsonPath('data.contact.whatsapp_url', 'https://wa.me/962790283438')
            ->assertJsonPath('data.contact.instagram_url', 'https://www.instagram.com/craft_supplies.jo/')
            ->assertJsonPath('data.contact.facebook_url', 'https://web.facebook.com/profile.php?id=61591919013692')
            ->assertJsonMissingPath('data.contact.youtube_url');

        $this->withHeader('Accept-Language', 'en')
            ->getJson('/api/v1/homepage-settings')
            ->assertOk()
            ->assertJsonPath('data.contact.address', 'Amman - Jordan');

        SiteSetting::query()->create(['values' => ['hero_style' => 'unsupported']]);

        $this->getJson('/api/v1/homepage-settings')
            ->assertOk()
            ->assertJsonPath('data.appearance.theme', 'theme_1')
            ->assertJsonPath('data.hero_style', 'hero_1');
    }

    public function test_filament_persists_the_website_theme(): void
    {
        $this->authenticateFilamentAdmin();

        Livewire::test(HomepageSettings::class)
            ->assertSchemaStateSet(['appearance.theme' => 'theme_1'])
            ->fillForm(['appearance.theme' => 'theme_1'])
            ->call('save')
            ->assertHasNoFormErrors();

        $settings = SiteSetting::query()->firstOrFail();

        $this->assertSame('theme_1', $settings->values['appearance']['theme']);
        $this->assertSame('theme_1', $settings->websiteTheme()->value);
        $this->getJson('/api/v1/homepage-settings')
            ->assertOk()
            ->assertJsonPath('data.appearance.theme', 'theme_1');

        $settings->update(['values' => array_replace_recursive($settings->values, [
            'appearance' => ['theme' => 'unsupported'],
        ])]);

        $this->assertSame('theme_1', $settings->fresh()->websiteTheme()->value);
    }

    public function test_contact_form_recipient_defaults_to_the_official_store_email(): void
    {
        $this->assertSame('info@craftsuppliesjo.com', config('mail.support_address'));
    }

    public function test_filament_persists_each_supported_hero_style(): void
    {
        $this->authenticateFilamentAdmin();

        Livewire::test(HomepageSettings::class)
            ->fillForm(['hero_style' => 'hero_2'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('hero_2', SiteSetting::query()->firstOrFail()->heroStyle()->value);
        $this->assertSame(
            'info@craftsuppliesjo.com',
            SiteSetting::query()->firstOrFail()->values['contact']['email'],
        );
        $this->getJson('/api/v1/homepage-settings')
            ->assertOk()
            ->assertJsonPath('data.hero_style', 'hero_2');

        Livewire::test(HomepageSettings::class)
            ->assertSchemaStateSet(['hero_style' => 'hero_2'])
            ->fillForm(['hero_style' => 'hero_1'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('hero_1', SiteSetting::query()->firstOrFail()->heroStyle()->value);
    }

    public function test_filament_persists_localized_hero_two_image_and_keeps_it_when_styles_change(): void
    {
        Storage::fake('public');
        $this->authenticateFilamentAdmin();

        Livewire::test(HomepageSettings::class)
            ->fillForm([
                'hero_style' => 'hero_2',
                'hero_2_media' => [UploadedFile::fake()->image('hero-two.webp')],
                'hero_2' => [
                    'eyebrow' => ['en' => 'Made for makers', 'ar' => 'صُمم للصنّاع'],
                    'title' => ['en' => 'Create something remarkable', 'ar' => 'اصنع شيئًا استثنائيًا'],
                    'description' => ['en' => 'Premium supplies for thoughtful work.', 'ar' => 'خامات مميزة لأعمال متقنة.'],
                    'primary_button_label' => ['en' => 'Shop now', 'ar' => 'تسوق الآن'],
                    'primary_button_url' => '/shop',
                    'secondary_button_label' => ['en' => 'Explore ideas', 'ar' => 'استكشف الأفكار'],
                    'secondary_button_url' => '/blog',
                ],
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $settings = SiteSetting::query()->firstOrFail();
        $image = $settings->getFirstMedia('hero_2_media');
        $this->assertNotNull($image);
        $this->assertSame('image/webp', $image->mime_type);

        Livewire::test(HomepageSettings::class)
            ->assertSchemaStateSet([
                'hero_style' => 'hero_2',
                'hero_2_media' => $image->uuid,
                'hero_2.title.en' => 'Create something remarkable',
            ]);

        $this->withHeader('Accept-Language', 'ar')
            ->getJson('/api/v1/homepage-settings')
            ->assertOk()
            ->assertJsonPath('data.hero_2.media.type', 'image')
            ->assertJsonPath('data.hero_2.media.url', $image->getFullUrl())
            ->assertJsonPath('data.hero_2.title', 'اصنع شيئًا استثنائيًا')
            ->assertJsonPath('data.hero_2.primary_button.label', 'تسوق الآن');

        Livewire::test(HomepageSettings::class)
            ->fillForm(['hero_style' => 'hero_1'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertNotNull($settings->fresh()->getFirstMedia('hero_2_media'));

        Livewire::test(HomepageSettings::class)
            ->assertSchemaStateSet(['hero_style' => 'hero_1'])
            ->fillForm(['hero_style' => 'hero_2'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('Create something remarkable', $settings->fresh()->values['hero_2']['title']['en']);
        $this->assertNotNull($settings->fresh()->getFirstMedia('hero_2_media'));
    }

    public function test_filament_replaces_image_with_video_and_api_detects_its_media_type(): void
    {
        Storage::fake('public');
        $this->authenticateFilamentAdmin();

        Livewire::test(HomepageSettings::class)
            ->fillForm([
                'hero_style' => 'hero_2',
                'hero_2_media' => [UploadedFile::fake()->create('hero-two.mp4', 512, 'video/mp4')],
                'hero_2_poster' => [UploadedFile::fake()->image('hero-two-poster.jpg')],
            ])
            ->call('save')
            ->assertHasNoFormErrors();

        $settings = SiteSetting::query()->firstOrFail();
        $video = $settings->getFirstMedia('hero_2_media');
        $poster = $settings->getFirstMedia('hero_2_poster');

        $this->assertNotNull($video);
        $this->assertSame('mp4', strtolower(pathinfo($video->file_name, PATHINFO_EXTENSION)));
        $this->assertNotNull($poster);

        $this->getJson('/api/v1/homepage-settings')
            ->assertOk()
            ->assertJsonPath('data.hero_2.media.type', 'video')
            ->assertJsonPath('data.hero_2.media.url', $video->getFullUrl())
            ->assertJsonPath('data.hero_2.media.poster_url', $poster->getFullUrl());
    }

    private function authenticateFilamentAdmin(): void
    {
        Filament::setCurrentPanel(Filament::getPanel('admin'));
        $this->actingAs(User::factory()->create([
            'role' => UserRole::Admin,
            'is_active' => true,
        ]));
    }
}

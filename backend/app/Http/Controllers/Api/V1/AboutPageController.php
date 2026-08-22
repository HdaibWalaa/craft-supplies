<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AboutPage;
use Illuminate\Http\JsonResponse;

class AboutPageController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $about = AboutPage::singleton();

        return response()->json([
            'data' => [
                'title' => $about->title,
                'paragraph_1' => $about->paragraph_1,
                'paragraph_2' => $about->paragraph_2,
                'features' => [
                    ['title' => $about->feature_1_title, 'description' => $about->feature_1_description],
                    ['title' => $about->feature_2_title, 'description' => $about->feature_2_description],
                    ['title' => $about->feature_3_title, 'description' => $about->feature_3_description],
                ],
            ],
        ]);
    }
}

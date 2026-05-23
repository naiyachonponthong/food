<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Upload an image (logo / cover / menu) and return its public URL.
     * Body: multipart with field "image". Returns { url }.
     */
    public function image(Request $request): JsonResponse
    {
        $maxKb = (int) (config('app.max_upload_size_mb', 5)) * 1024;
        $request->validate([
            'image' => ['required', 'file', 'image', "max:$maxKb"],
            'kind' => ['nullable', 'in:logo,cover,menu,slip'],
        ]);

        $kind = $request->kind ?? 'menu';
        $file = $request->file('image');
        $ext = $file->getClientOriginalExtension() ?: 'jpg';
        $name = $kind . '-' . Str::uuid() . '.' . $ext;
        $path = $file->storeAs("public/uploads/{$kind}", $name);
        $url = Storage::url($path);

        return response()->json([
            'url' => $url,
            'path' => $path,
            'size' => $file->getSize(),
            'mime' => $file->getMimeType(),
        ]);
    }
}

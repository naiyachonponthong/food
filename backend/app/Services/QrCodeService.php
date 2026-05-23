<?php

namespace App\Services;

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\PngWriter;

class QrCodeService
{
    public function generate(string $text, int $size = 400): string
    {
        $builder = new Builder(
            writer: new PngWriter(),
            data: $text,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: $size,
            margin: 10,
        );
        return $builder->build()->getString();
    }

    public function dataUri(string $text, int $size = 400): string
    {
        return 'data:image/png;base64,' . base64_encode($this->generate($text, $size));
    }

    public function customerSessionUrl(string $token): string
    {
        $base = rtrim(config('app.customer_url', 'http://localhost:3000'), '/');
        return $base . '/' . $token;
    }
}

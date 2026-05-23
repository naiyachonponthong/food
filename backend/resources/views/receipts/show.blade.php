<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>Receipt {{ $payment->receipt_number }}</title>
<style>
  @page { size: 80mm auto; margin: 4mm; }
  * { box-sizing: border-box; }
  body {
    font-family: 'IBM Plex Sans Thai', 'Sarabun', monospace;
    font-size: 12px;
    color: #000;
    background: #fff;
    width: 76mm;
    margin: 0 auto;
    padding: 4mm 2mm;
    line-height: 1.4;
  }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: 700; }
  .big { font-size: 14px; }
  .xl { font-size: 18px; }
  hr {
    border: none;
    border-top: 1px dashed #000;
    margin: 6px 0;
  }
  .row {
    display: flex;
    justify-content: space-between;
    gap: 6px;
  }
  .meta { font-size: 10px; color: #555; }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0;
  }
  td { padding: 1px 0; vertical-align: top; }
  .qty { width: 22px; }
  .price { white-space: nowrap; text-align: right; }
  .opt { font-size: 10px; color: #555; padding-left: 2px; }
  .footer { margin-top: 8px; font-size: 10px; text-align: center; }
  .total-row {
    border-top: 1px solid #000;
    padding-top: 4px;
    margin-top: 4px;
    font-weight: 700;
    font-size: 14px;
  }
  .badge {
    display: inline-block;
    padding: 1px 4px;
    border: 1px solid #000;
    border-radius: 3px;
    font-size: 9px;
    margin-left: 3px;
  }
  @media print {
    body { padding: 0; }
  }
</style>
</head>
<body>
  <div class="center">
    <div class="bold big">{{ $restaurant?->name }}</div>
    @if ($restaurant?->address)
      <div class="meta">{{ $restaurant->address }}</div>
    @endif
    @if ($restaurant?->phone)
      <div class="meta">โทร {{ $restaurant->phone }}</div>
    @endif
    @if ($restaurant?->tax_id)
      <div class="meta">เลขผู้เสียภาษี {{ $restaurant->tax_id }}</div>
    @endif
  </div>

  <hr>
  <div class="row meta">
    <span>เลขที่ใบเสร็จ</span>
    <span class="bold">{{ $payment->receipt_number }}</span>
  </div>
  <div class="row meta">
    <span>วันที่</span>
    <span>{{ ($payment->paid_at ?? now())->setTimezone('Asia/Bangkok')->format('Y-m-d H:i') }}</span>
  </div>
  <div class="row meta">
    <span>โต๊ะ</span>
    <span class="bold">{{ $session?->table?->name }}</span>
  </div>
  @if ($isBuffet)
    <div class="row meta">
      <span>ประเภท</span>
      <span class="bold">บุฟเฟ่ต์ · {{ $package?->name }}</span>
    </div>
    <div class="row meta">
      <span>จำนวนคน</span>
      <span>ผู้ใหญ่ {{ $session->guest_adult }} · เด็ก {{ $session->guest_child }}</span>
    </div>
  @endif

  <hr>

  <table>
    @foreach ($items->groupBy('round') as $round => $rows)
      <tr><td colspan="3" class="meta bold">รอบ {{ $round }}</td></tr>
      @foreach ($rows as $it)
        <tr>
          <td class="qty bold">{{ $it['qty'] }}x</td>
          <td>{{ $it['name'] }}
            @if ($it['is_refill'])<span class="badge">REFILL</span>@endif
          </td>
          <td class="price">
            @if ($it['is_refill'])
              —
            @else
              {{ number_format($it['subtotal'], 2) }}
            @endif
          </td>
        </tr>
        @if (!empty($it['options']))
          <tr><td></td><td colspan="2" class="opt">› {{ implode(' · ', $it['options']) }}</td></tr>
        @endif
        @if ($it['note'])
          <tr><td></td><td colspan="2" class="opt">* {{ $it['note'] }}</td></tr>
        @endif
      @endforeach
    @endforeach
  </table>

  <hr>

  @if ($isBuffet)
    <div class="row">
      <span>ค่าหัวเหมา</span>
      <span class="price">{{ number_format((float) $payment->package_charge, 2) }}</span>
    </div>
    @if ($payment->addon_charge > 0)
      <div class="row">
        <span>Add-on</span>
        <span class="price">{{ number_format((float) $payment->addon_charge, 2) }}</span>
      </div>
    @endif
    @if ($payment->extension_charge > 0)
      <div class="row">
        <span>ค่าต่อเวลา</span>
        <span class="price">{{ number_format((float) $payment->extension_charge, 2) }}</span>
      </div>
    @endif
  @else
    <div class="row">
      <span>รวมรายการ</span>
      <span class="price">{{ number_format((float) $payment->subtotal, 2) }}</span>
    </div>
  @endif

  @if ($payment->discount > 0)
    <div class="row">
      <span>ส่วนลด</span>
      <span class="price">- {{ number_format((float) $payment->discount, 2) }}</span>
    </div>
  @endif
  @if ($payment->service_charge > 0)
    <div class="row">
      <span>Service Charge {{ (float) ($settings->service_charge ?? 0) }}%</span>
      <span class="price">{{ number_format((float) $payment->service_charge, 2) }}</span>
    </div>
  @endif
  @if ($payment->vat_amount > 0)
    <div class="row">
      <span>VAT {{ (float) ($restaurant->vat_rate ?? 7) }}%</span>
      <span class="price">{{ number_format((float) $payment->vat_amount, 2) }}</span>
    </div>
  @endif

  <div class="row total-row">
    <span>รวมทั้งสิ้น</span>
    <span class="price xl">{{ number_format((float) $payment->total, 2) }}</span>
  </div>

  <hr>

  <div class="row">
    <span>ชำระโดย</span>
    <span class="bold">{{ $methodLabel }}</span>
  </div>
  @if ($payment->amount_paid !== null && $payment->method === 'cash')
    <div class="row meta">
      <span>รับเงิน</span><span>{{ number_format((float) $payment->amount_paid, 2) }}</span>
    </div>
    <div class="row meta">
      <span>ทอน</span><span>{{ number_format((float) $payment->change_amount, 2) }}</span>
    </div>
  @endif

  <div class="footer">
    ขอบคุณที่ใช้บริการ<br>
    {{ $restaurant?->name }}
  </div>

  @if ($autoprint)
    <script>
      window.onload = function () { window.print(); };
    </script>
  @endif
</body>
</html>

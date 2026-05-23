<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Menu;
use App\Models\MenuCategory;
use App\Models\Package;
use App\Models\PackageAddon;
use App\Models\PackageItem;
use App\Models\Restaurant;
use App\Models\RestaurantSetting;
use App\Models\Table;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $r = Restaurant::create([
            'name' => 'ครัวเพลิน',
            'slug' => 'plearn-kitchen',
            'address' => '88/1 ซ.ทองหล่อ 10 ถ.สุขุมวิท คลองตัน วัฒนา กรุงเทพ 10110',
            'phone' => '02-123-4567',
            'tax_id' => '0105561234567',
            'has_vat' => true,
            'vat_rate' => 7,
        ]);

        RestaurantSetting::create([
            'restaurant_id' => $r->id,
            'mode' => 'normal',
            'auto_confirm_order' => false,
            'kitchen_print_auto' => true,
            'slip_verify_enabled' => true,
            'promptpay_number' => '0812345678',
            'service_charge' => 10,
            'theme_color' => '#3B82F6',
            'allow_call_staff' => true,
            'call_staff_options' => ['utensils', 'spice', 'water', 'clean', 'other'],
            'allow_self_checkout' => true,
        ]);

        User::create([
            'restaurant_id' => $r->id,
            'name' => 'Owner', 'email' => 'owner@plearn.test',
            'password' => 'password', 'role' => 'owner',
        ]);
        User::create([
            'restaurant_id' => $r->id,
            'name' => 'Nawawat', 'email' => 'staff@plearn.test',
            'password' => 'password', 'role' => 'cashier',
        ]);
        User::create([
            'restaurant_id' => $r->id,
            'name' => 'Kitchen', 'email' => 'kitchen@plearn.test',
            'password' => 'password', 'role' => 'kitchen',
        ]);

        $cats = [
            ['rice', 'ข้าวกับข้าว'],
            ['noodle', 'เส้น'],
            ['stir-fry', 'ผัด ๆ'],
            ['soup', 'ต้ม / แกง'],
            ['salad', 'ยำ / สลัด'],
            ['drink', 'เครื่องดื่ม'],
            ['dessert', 'ของหวาน'],
        ];
        $catMap = [];
        foreach ($cats as $i => [$icon, $name]) {
            $catMap[$icon] = MenuCategory::create([
                'restaurant_id' => $r->id,
                'name' => $name, 'icon' => $icon, 'sort_order' => $i,
            ])->id;
        }

        $menus = [
            ['rice', 'ผัดกะเพราหมูสับไข่ดาว', 89, 32, ['ขายดี', 'เผ็ด'], true],
            ['rice', 'ข้าวมันไก่ต้ม', 75, 28, ['แนะนำ'], true],
            ['rice', 'ข้าวขาหมูตุ๋นเปื่อย', 95, 38, ['ขายดี'], false],
            ['noodle', 'ผัดไทยกุ้งสด', 129, 52, ['แนะนำ', 'ยอดนิยม'], true],
            ['noodle', 'บะหมี่หมูแดงเกี๊ยว', 79, 30, [], false],
            ['noodle', 'เย็นตาโฟทรงเครื่อง', 85, 34, [], false],
            ['stir-fry', 'ผัดซีอิ๊วหมู', 89, 32, [], false],
            ['stir-fry', 'ผัดผักรวมน้ำมันหอย', 75, 22, ['เจ'], false],
            ['soup', 'ต้มยำกุ้งน้ำข้น', 189, 78, ['เผ็ด', 'ซิกเนเจอร์'], true],
            ['soup', 'แกงเขียวหวานไก่', 99, 40, ['เผ็ด'], false],
            ['salad', 'ส้มตำไทยกุ้งสด', 89, 30, ['เผ็ด'], false],
            ['salad', 'ลาบหมูสับอีสาน', 95, 36, ['เผ็ด'], false],
            ['drink', 'ชาเย็นรสไทย', 45, 12, ['เย็น'], false],
            ['drink', 'โซดามะนาว', 35, 8, ['เย็น'], false],
            ['drink', 'น้ำเปล่า', 15, 5, [], false],
            ['dessert', 'ข้าวเหนียวมะม่วงน้ำดอกไม้', 79, 28, [], true],
            ['dessert', 'บัวลอยไข่หวานกะทิสด', 55, 18, [], false],
        ];
        $menuIds = [];
        foreach ($menus as $m) {
            $menu = Menu::create([
                'restaurant_id' => $r->id, 'category_id' => $catMap[$m[0]],
                'name' => $m[1], 'price' => $m[2], 'cost' => $m[3],
                'tags' => $m[4], 'is_available' => true, 'is_featured' => $m[5],
            ]);
            $menuIds[$m[1]] = $menu->id;
        }

        $tnum = 1;
        foreach ([
            ['ในร้าน', 'A', 8, 4],
            ['นอกร้าน', 'B', 6, 4],
            ['ชั้น 2', 'C', 5, 6],
            ['VIP', 'V', 1, 10],
        ] as [$zone, $letter, $count, $cap]) {
            for ($i = 1; $i <= $count; $i++) {
                Table::create([
                    'restaurant_id' => $r->id, 'number' => $tnum,
                    'name' => $letter . $i, 'capacity' => $cap, 'zone' => $zone,
                    'qr_type' => $letter === 'V' ? 'dynamic' : 'static',
                ]);
                $tnum++;
            }
        }

        $premium = Package::create([
            'restaurant_id' => $r->id, 'name' => 'Premium Buffet',
            'description' => 'บุฟเฟ่ต์ชาบูพรีเมียม วัตถุดิบนำเข้า',
            'price_adult' => 399, 'price_child' => 199.5,
            'price_child_min_age' => 6, 'price_child_max_age' => 12,
            'duration_minutes' => 120, 'last_order_before' => 15,
            'extension_price' => 100, 'extension_minutes' => 30,
        ]);
        Package::create([
            'restaurant_id' => $r->id, 'name' => 'Standard Buffet',
            'price_adult' => 299, 'price_child' => 149.5,
            'price_child_min_age' => 6, 'price_child_max_age' => 12,
            'duration_minutes' => 90, 'last_order_before' => 10,
            'extension_price' => 75, 'extension_minutes' => 30,
        ]);
        foreach (['ผัดผักรวมน้ำมันหอย', 'น้ำเปล่า', 'ชาเย็นรสไทย', 'แกงเขียวหวานไก่'] as $name) {
            PackageItem::create(['package_id' => $premium->id, 'menu_id' => $menuIds[$name]]);
        }
        PackageAddon::create(['package_id' => $premium->id, 'menu_id' => $menuIds['ผัดไทยกุ้งสด'], 'price' => 49]);
        PackageAddon::create(['package_id' => $premium->id, 'menu_id' => $menuIds['ต้มยำกุ้งน้ำข้น'], 'price' => 89]);

        $ec = [];
        foreach ([
            ['salary', 'ค่าแรง'],
            ['rent', 'ค่าเช่า'],
            ['utility', 'ค่าน้ำ/ไฟ/แก๊ส'],
            ['packaging', 'ค่า Packaging'],
            ['repair', 'ค่าซ่อมบำรุง'],
            ['marketing', 'การตลาด'],
            ['other', 'อื่นๆ'],
        ] as $i => [$icon, $name]) {
            $ec[$icon] = ExpenseCategory::create([
                'restaurant_id' => $r->id, 'name' => $name, 'icon' => $icon, 'sort_order' => $i,
            ])->id;
        }
        $today = now()->startOfMonth();
        Expense::create([
            'restaurant_id' => $r->id, 'category_id' => $ec['salary'],
            'amount' => 75000, 'note' => 'เงินเดือนพนักงาน 5 คน',
            'expense_date' => $today->copy()->day(1),
        ]);
        Expense::create([
            'restaurant_id' => $r->id, 'category_id' => $ec['rent'],
            'amount' => 45000, 'note' => 'ค่าเช่าเดือนนี้',
            'expense_date' => $today->copy()->day(1),
        ]);
        Expense::create([
            'restaurant_id' => $r->id, 'category_id' => $ec['utility'],
            'amount' => 8500, 'note' => 'ค่าไฟฟ้า',
            'expense_date' => $today->copy()->day(3),
        ]);

        $this->command->info("Seeded restaurant: {$r->name}");
        $this->command->info('Login: owner@plearn.test / password (owner role)');
    }
}

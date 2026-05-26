<?php

namespace App\Providers\Filament;

use App\Filament\Pages\Profile;
use App\Filament\Widgets\LowStockProductsTable;
use App\Filament\Widgets\OrdersByStatusChart;
use App\Filament\Widgets\OrdersTrendChart;
use App\Filament\Widgets\RecentOrdersTable;
use App\Filament\Widgets\RevenueByDayChart;
use App\Filament\Widgets\StoreStatsOverview;
use App\Filament\Widgets\TopSellingProductsTable;
use App\Http\Middleware\SetFilamentLocale;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\View\PanelsRenderHook;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Support\HtmlString;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->font('Cairo')
            ->brandName('الأطرقجي')
            ->brandLogo(asset('images/alatraqji-logo.png'))
            ->brandLogoHeight('4rem')
            ->favicon(asset('images/alatraqji-logo.png'))
            ->colors([
                'primary' => Color::Orange,
            ])
            ->viteTheme('resources/css/filament/admin/theme.css')
            ->spa()
            ->sidebarCollapsibleOnDesktop()
            ->maxContentWidth('full')
            ->navigationGroups([
                'المبيعات',
                'المتجر',
                'التسويق والبكسلات',
                'الإعدادات',
                'التحليلات',
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\\Filament\\Pages')
            ->pages([
                Profile::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\Filament\\Widgets')
            ->widgets([
                StoreStatsOverview::class,
                RevenueByDayChart::class,
                OrdersTrendChart::class,
                OrdersByStatusChart::class,
                RecentOrdersTable::class,
                TopSellingProductsTable::class,
                LowStockProductsTable::class,
            ])
            ->renderHook(
                PanelsRenderHook::BODY_END,
                fn (): HtmlString => new HtmlString(
                    '<script>(()=>{let d=document.createElement("div");d.id="fi-loading-overlay";d.style.cssText="display:none;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;background:rgba(0,0,0,.6);backdrop-filter:blur(4px)";d.innerHTML=`<div style="text-align:center"><img src="/images/alatraqji-logo.png" style="width:80px;height:80px;border-radius:50%;animation:pulse 1s ease-in-out infinite"><p style="color:#f97316;margin-top:16px;font-family:Cairo;font-size:14px">جارٍ التحميل...</p></div>`;document.body.appendChild(d);document.addEventListener("click",e=>{let l=e.target.closest("[wire\\:navigate]");if(!l)return;if(l.href===location.href){e.preventDefault();location.reload();return}document.getElementById("fi-loading-overlay").style.display="flex"});let observer=new MutationObserver(()=>{document.getElementById("fi-loading-overlay").style.display="none"});observer.observe(document.body,{childList:true,subtree:true})})()</script>'
                ),
            )
            ->middleware([
                SetFilamentLocale::class,
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}

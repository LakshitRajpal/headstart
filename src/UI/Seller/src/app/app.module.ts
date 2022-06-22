// angular core
import { BrowserModule } from '@angular/platform-browser'
import { NgModule, ErrorHandler, Inject } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientModule, HttpClient } from '@angular/common/http'

// 3rd party
import { OrderCloudModule, Configuration } from '@ordercloud/angular-sdk'
import { OcSDKConfig } from '@app-seller/config/ordercloud-sdk.config'
import { CookieModule } from 'ngx-cookie'
import { ToastrModule } from 'ngx-toastr'
import { NgProgressModule } from '@ngx-progressbar/core'
import { NgProgressHttpModule } from '@ngx-progressbar/http'
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
} from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

// app modules
import { AppConfig, SharedModule } from '@app-seller/shared'
import { LayoutModule } from '@app-seller/layout/layout.module'

// app component
import { AppComponent } from '@app-seller/app.component'

// interceptors
import { HTTP_INTERCEPTORS } from '@angular/common/http'

import { CacheInterceptor } from '@app-seller/auth/interceptors/cache/cache-interceptor'

// error handler config
import { AppErrorHandler } from './config/error-handling.config'
import { Configuration as HeadstartConfiguration } from '@ordercloud/headstart-sdk'
import {
  Configuration as OcConfiguration,
  SdkConfiguration,
} from 'ordercloud-javascript-sdk'
import { applicationConfiguration, ocAppConfig } from './config/app.config'
import { CMSConfiguration } from '@ordercloud/cms-sdk'
import { AuthModule } from './auth/auth.module'
import { AutoAppendTokenInterceptor } from './auth/interceptors/auto-append-token/auto-append-token.interceptor'
import { RefreshTokenInterceptor } from './auth/interceptors/refresh-token/refresh-token.interceptor'
import { AppRoutingModule } from './app-routing.module'
import { RouterModule } from '@angular/router'
import { LanguageSelectorService } from '@app-seller/shared'

export function HttpLoaderFactory(
  http: HttpClient,
  ocAppConfig: AppConfig
): TranslateHttpLoader {
  return new TranslateHttpLoader(http, ocAppConfig.translateBlobUrl)
}
export enum OrdercloudEnv {
  Production = 'Production',
  Staging = 'Staging',
  Sandbox = 'Sandbox',
}
@NgModule({
  declarations: [AppComponent],
  imports: [
    // angular core modules
    BrowserAnimationsModule,
    BrowserModule,
    RouterModule,
    // app modules
    AppRoutingModule,
    AuthModule,
    LayoutModule,

    /**
     * third party modules
     * only those that must be installed
     * with forRoot (except shared) should be defined here, all else
     * can live in shared
     */
    SharedModule,
    HttpClientModule,
    NgProgressModule,
    NgProgressHttpModule,
    OrderCloudModule.forRoot(OcSDKConfig),
    CookieModule.forRoot(),
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient, ocAppConfig],
      },
    }),
  ],
  providers: [
    { provide: ocAppConfig, useValue: ocAppConfig },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AutoAppendTokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RefreshTokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true,
    },
    { provide: ErrorHandler, useClass: AppErrorHandler },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(
    @Inject(applicationConfiguration) private appConfig: AppConfig,
    public translate: TranslateService,
    private languageService: LanguageSelectorService
  ) {
    HeadstartConfiguration.Set({
      baseApiUrl: this.appConfig.middlewareUrl,
      orderCloudApiUrl: this.appConfig.orderCloudApiUrl,
      clientID: this.appConfig.clientID,
      cookieOptions: {
        prefix: this.appConfig.appname.replace(/ /g, '_').toLowerCase(),
      },
    })

    OcConfiguration.Set({
      baseApiUrl: this.appConfig.orderCloudApiUrl,
      clientID: this.appConfig.clientID,
      cookieOptions: {
        prefix: this.appConfig.appname.replace(/ /g, '_').toLowerCase(),
      },
    })

    this.configureTranslationService()
  }

  configureTranslationService(): void {
    if (this.appConfig.supportedLanguages && this.appConfig.supportedLanguages.length === 0){
      throw new Error('supportedLanguages not defined in appConfig.')
    }
    this.translate.addLangs(this.appConfig.supportedLanguages)
    const languages = this.translate.getLangs()

    if (!this.appConfig.defaultLanguage) {
      throw new Error('defaultLanguage not defined in appConfig.')
    }
    if (languages.includes(this.appConfig.defaultLanguage)) {
      this.translate.setDefaultLang(this.appConfig.defaultLanguage)
    }

    this.languageService.SetTranslateLanguage()
  }
}

import { Component, OnInit } from '@angular/core';

interface RobotsOption {
  key: string;
  title: string;
  description: string;
  checked: boolean;
  isDefault?: boolean;
}

interface AdvancedSettings {
  maxSnippet: number | null;
  imagePreview: string;
  unavailableAfter: string;
}

@Component({
  selector: 'app-robots-seo',
  templateUrl: './robots-seo.component.html',
  styleUrls: ['./robots-seo.component.css']
})
export class RobotsSeoComponent implements OnInit {
  
  robotsOptions: RobotsOption[] = [
    {
      key: 'index',
      title: 'Index',
      description: 'به موتور جستجو اجازه می‌دهد که صفحه شما را ایندکس کرده و در نتایج جستجو نمایش دهد.',
      checked: true,
      isDefault: true
    },
    {
      key: 'noindex',
      title: 'NoIndex',
      description: 'به موتور جستجو دستور می‌دهد که صفحه شما را ایندکس نکند و آن را از نتایج جستجو حذف کند.',
      checked: false
    },
    {
      key: 'follow',
      title: 'Follow',
      description: 'به موتور جستجو اجازه می‌دهد که تمام لینک‌های موجود در صفحه شما را دنبال کرده و آن‌ها را خزش (crawl) کند.',
      checked: true,
      isDefault: true
    },
    {
      key: 'nofollow',
      title: 'NoFollow',
      description: 'به موتور جستجو دستور می‌دهد که هیچ‌کدام از لینک‌های موجود در صفحه شما را دنبال نکند.',
      checked: false
    },
    {
      key: 'noarchive',
      title: 'NoArchive',
      description: 'از نمایش نسخه کش شده یا بایگانی شده صفحه در نتایج جستجو جلوگیری می‌کند.',
      checked: false
    },
    {
      key: 'nosnippet',
      title: 'NoSnippet',
      description: 'از نمایش خلاصه (Snippet) ویدیویی یا متنی صفحه در نتایج جستجو جلوگیری می‌کند.',
      checked: false
    },
    {
      key: 'notranslate',
      title: 'NoTranslate',
      description: 'به گوگل دستور می‌دهد که گزینه ترجمه این صفحه را برای کاربران در نتایج جستجو ارائه ندهد.',
      checked: false
    }
  ];

  advancedSettings: AdvancedSettings = {
    maxSnippet: null,
    imagePreview: '',
    unavailableAfter: ''
  };

  imagePreviewOptions = [
    { value: '', label: 'پیش‌فرض' },
    { value: 'none', label: 'هیچ‌کدام' },
    { value: 'standard', label: 'استاندارد' },
    { value: 'large', label: 'بزرگ' }
  ];

  showWarning = false;
  metaContent = '';
  effects: string[] = [];

  private effectsMap = {
    default: [
      'صفحه نمایه‌سازی شده و در نتایج جستجو نمایش داده می‌شود',
      'لینک‌های این صفحه توسط موتورهای جستجو دنبال می‌شوند',
      'نسخه کش شده این صفحه در دسترس خواهد بود',
      'خلاصه متن در نتایج جستجو نمایش داده می‌شود',
      'ترجمه صفحه توسط موتورهای جستجو پیشنهاد می‌شود'
    ],
    index: 'صفحه نمایه‌سازی شده و در نتایج جستجو نمایش داده می‌شود',
    noindex: 'صفحه نمایه‌سازی نمی‌شود و در نتایج جستجو نمایش داده نمی‌شود',
    follow: 'لینک‌های این صفحه توسط موتورهای جستجو دنبال می‌شوند و اعتبار سئویی منتقل می‌شود',
    nofollow: 'لینک‌های این صفحه توسط موتورهای جستجو دنبال نمی‌شوند و اعتبار سئویی منتقل نمی‌شود',
    noarchive: 'نسخه کش شده این صفحه در موتورهای جستجو نمایش داده نمی‌شود',
    nosnippet: 'خلاصه متن این صفحه در نتایج جستجو نمایش داده نمی‌شود',
    notranslate: 'ترجمه این صفحه توسط موتورهای جستجو پیشنهاد نمی‌شود'
  };

  ngOnInit(): void {
    this.updatePreview();
    this.updateEffects();
  }

  onOptionChange(option: RobotsOption): void {
    // Handle mutual exclusivity based on the new state
    if (option.key === 'index' && option.checked) {
      this.setOptionChecked('noindex', false);
    } else if (option.key === 'noindex' && option.checked) {
      this.setOptionChecked('index', false);
      // When noindex is selected, disable follow/nofollow
      this.setOptionChecked('follow', false);
      this.setOptionChecked('nofollow', false);
    } else if (option.key === 'noindex' && !option.checked) {
      // If unchecking noindex, automatically check index
      this.setOptionChecked('index', true);
    } else if (option.key === 'follow' && option.checked) {
      this.setOptionChecked('nofollow', false);
    } else if (option.key === 'nofollow' && option.checked) {
      this.setOptionChecked('follow', false);
    }

    this.updatePreview();
    this.updateEffects();
  }

  toggleOption(option: RobotsOption): void {
    option.checked = !option.checked;
    this.onOptionChange(option);
  }

  onAdvancedSettingChange(): void {
    this.updatePreview();
    this.updateEffects();
  }

  private setOptionChecked(key: string, checked: boolean): void {
    const option = this.robotsOptions.find(opt => opt.key === key);
    if (option) {
      option.checked = checked;
    }
  }

  private getCheckedOptions(): string[] {
    return this.robotsOptions
      .filter(option => option.checked)
      .map(option => option.key);
  }

  private updatePreview(): void {
    const selectedOptions = this.getCheckedOptions();
    const content: string[] = [];

    // Handle index/noindex
    if (selectedOptions.includes('noindex')) {
      content.push('noindex');
    } else if (selectedOptions.includes('index')) {
      content.push('index');
    } else {
      content.push('index');
    }

    // Handle follow/nofollow
    if (selectedOptions.includes('nofollow')) {
      content.push('nofollow');
    } else if (selectedOptions.includes('follow')) {
      content.push('follow');
    } else if (!selectedOptions.includes('noindex')) {
      content.push('follow');
    }

    // Add other options
    selectedOptions.forEach(option => {
      if (!['index', 'noindex', 'follow', 'nofollow'].includes(option)) {
        content.push(option);
      }
    });

    // Add advanced settings
    if (this.advancedSettings.maxSnippet) {
      content.push(`max-snippet:${this.advancedSettings.maxSnippet}`);
    }

    if (this.advancedSettings.imagePreview) {
      content.push(`max-image-preview:${this.advancedSettings.imagePreview}`);
    }

    if (this.advancedSettings.unavailableAfter) {
      const date = new Date(this.advancedSettings.unavailableAfter);
      const formattedDate = date.toISOString().split('T')[0] + ' ' + 
                           date.toTimeString().split(' ')[0];
      content.push(`unavailable_after:${formattedDate}`);
    }

    this.metaContent = content.join(', ');
  }

  private updateEffects(): void {
    const selectedOptions = this.getCheckedOptions();
    const effectsArray: string[] = [];

    // Check for noindex warning
    this.showWarning = selectedOptions.includes('noindex');

    // Index/NoIndex effects
    if (selectedOptions.includes('noindex')) {
      effectsArray.push(this.effectsMap.noindex);
    } else {
      effectsArray.push(this.effectsMap.index);
    }

    // Follow/NoFollow effects
    if (selectedOptions.includes('nofollow')) {
      effectsArray.push(this.effectsMap.nofollow);
    } else {
      effectsArray.push(this.effectsMap.follow);
    }

    // Archive effects
    if (selectedOptions.includes('noarchive')) {
      effectsArray.push(this.effectsMap.noarchive);
    } else {
      effectsArray.push('نسخه کش شده این صفحه در دسترس خواهد بود');
    }

    // Snippet effects
    if (selectedOptions.includes('nosnippet')) {
      effectsArray.push(this.effectsMap.nosnippet);
    } else {
      effectsArray.push('خلاصه متن در نتایج جستجو نمایش داده می‌شود');
    }

    // Translate effects
    if (selectedOptions.includes('notranslate')) {
      effectsArray.push(this.effectsMap.notranslate);
    } else {
      effectsArray.push('ترجمه صفحه توسط موتورهای جستجو پیشنهاد می‌شود');
    }

    // Advanced settings effects
    if (this.advancedSettings.maxSnippet) {
      effectsArray.push(`حداکثر طول خلاصه محدود به ${this.advancedSettings.maxSnippet} کاراکتر - خلاصه‌های طولانی‌تر کوتاه می‌شوند`);
    }

    if (this.advancedSettings.imagePreview) {
      const sizeText = {
        'none': 'هیچ‌کدام - هیچ تصویری در نتایج جستجو نمایش داده نمی‌شود',
        'standard': 'تصاویر با اندازه معمولی نمایش داده می‌شوند',
        'large': 'تصاویر با اندازه بزرگ‌تر و جذاب‌تر نمایش داده می‌شوند'
      };
      effectsArray.push(`اندازه پیش‌نمایش تصویر: ${sizeText[this.advancedSettings.imagePreview as keyof typeof sizeText]}`);
    }

    if (this.advancedSettings.unavailableAfter) {
      const persianDate = new Date(this.advancedSettings.unavailableAfter).toLocaleDateString('fa-IR');
      effectsArray.push(`صفحه پس از تاریخ ${persianDate} در نتایج جستجو نمایش داده نخواهد شد و به صورت خودکار حذف می‌شود`);
    }

    this.effects = effectsArray;
  }

  getOptionClass(option: RobotsOption): string {
    let classes = 'robchk';
    if (option.checked) {
      classes += ' robact';
    }
    if (option.isDefault && option.checked) {
      classes += ' robdef';
    }
    return classes;
  }

  onSave(): void {
    const robotsData = {
      options: this.robotsOptions.filter(opt => opt.checked).map(opt => opt.key),
      advancedSettings: this.advancedSettings,
      metaContent: this.metaContent
    };
    
    console.log('Robots SEO Settings:', robotsData);
    // Here you would typically send this data to your backend service
    alert('تنظیمات SEO با موفقیت ذخیره شد!');
  }
}
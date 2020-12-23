import { Component, OnDestroy } from '@angular/core';
import { EChartOption } from 'echarts';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataService } from 'src/app/core/shared/services/data.service';
const PouchDB = require('pouchdb').default;
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-words',
  templateUrl: './words.component.html',
  styleUrls: ['./words.component.css']
})
export class WordsComponent implements OnDestroy {
  pouchdb: any;
  ngDestroy$ = new Subject();
  public chartOption: any;
  private chartType: string;
  radio: string;
  subscription: Subscription;
  userPackage: string;
  isSuperUser: boolean;

  constructor(private data: DataService, private spinner: NgxSpinnerService) {
    this.pouchdb = new PouchDB('analysisStore');

    this.subscription = this.data
      .getFilters()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((filt) => {
        const storeId = sessionStorage.getItem('storekeyId');
        this.getGraph(storeId);
      });

    this.subscription = this.data
      .getDateChange()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((key) => {
        this.getGraph(key);
      });

    this.data.changeReportName('Word Cloud');
    this.data.changeNav('Words');

    const storeId = sessionStorage.getItem('storekeyId');
    this.getGraph(storeId);
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }

  showSpinner() {
    this.spinner.show();
  }

  onChartClick(evt) {
    console.log(evt);
  }

  get isMedium() {
    return sessionStorage.getItem('clientSubscription') == 'MEDIUM';
  }

  getGraph(storeId) {
    this.pouchdb.get(storeId).then((res) => {
      let userData = res.data;

      const userFilter = JSON.parse(sessionStorage.getItem('userFilter'));

      if (userFilter.brand.length > 0) userData = res.data.filter((item) => userFilter.brand.includes(item.brand));

      if (userFilter.source.length > 0) userData = res.data.filter((item) => userFilter.brand.includes(item.brand));
      if (userFilter.mediatype.length > 0)
        userData = res.data.filter((item) => userFilter.mediatype.includes(item.mediatype));
      if (userFilter.category.length > 0)
        userData = res.data.filter((item) => userFilter.category.includes(item.category));
      if (userFilter.subcategory.length > 0)
        userData = res.data.filter((item) => userFilter.subcategory.includes(item.subcategory));
      if (userFilter.adverttype.length > 0)
        userData = res.data.filter((item) => userFilter.adverttype.includes(item.adverttype));
      if (userFilter.language.length > 0)
        userData = res.data.filter((item) => userFilter.language.includes(item.language));
      if (userFilter.location.length > 0)
        userData = res.data.filter((item) => userFilter.location.includes(item.region));
      if (userFilter.type.length > 0) userData = res.data.filter((item) => userFilter.type.includes(item.type));
      if (userFilter.sentiment.length > 0)
        userData = res.data.filter((item) => userFilter.sentiment.includes(item.sentiment));
      if (userFilter.author.length > 0) userData = res.data.filter((item) => userFilter.author.includes(item.author));
      if (userFilter.topic.length > 0) userData = res.data.filter((item) => userFilter.topic.includes(item.topic));
      if (userFilter.country.length > 0)
        userData = res.data.filter((item) => userFilter.country.includes(item.country));
      if (userFilter.exclude.length > 0) userData = res.data.filter((item) => !userFilter.exclude.includes(item.id));

      const txt = userData.map((t) => t.description);

      let text = '';

      txt.forEach((r) => {
        text = text + r;
      });

      text = this.remove_stopwords(text.toLowerCase());

      const keywords = this.getFrequency2(text);

      let data = [];
      // eslint-disable-next-line guard-for-in
      for (const name in keywords) {
        data.push({
          name,
          value: Math.sqrt(keywords[name])
        });
      }

      data = data
        .sort((a, b) => {
          return b.value - a.value;
        })
        .slice(0, 50);

      this.chartOption = {
        series: [
          {
            type: 'wordCloud',
            sizeRange: [25, 350],
            rotationRange: [-90, 90],
            rotationStep: 45,
            gridSize: 18,
            left: 'center',
            top: 'center',
            width: '70%',
            height: '80%',
            right: null,
            bottom: null,
            shape: 'pentagon',
            drawOutOfBound: false,
            textStyle: {
              normal: {
                color: () => {
                  return (
                    'rgb(' +
                    [
                      Math.round(Math.random() * 160),
                      Math.round(Math.random() * 160),
                      Math.round(Math.random() * 160)
                    ].join(',') +
                    ')'
                  );
                }
              },
              emphasis: {
                color: 'red'
              }
            },
            data
          }
        ]
      };
    });
    this.spinner.hide();
  }

  getFrequency2(str) {
    const cleanString = str.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    const words = cleanString.split(' ');
    const frequencies = {};
    let word: any;
    let i;

    for (i = 0; i < words.length; i++) {
      word = words[i];
      frequencies[word] = frequencies[word] || 0;
      frequencies[word]++;
    }

    return frequencies;
  }

  remove_stopwords(str) {
    const stopwords = [
      'a',
      'about',
      'above',
      'after',
      'again',
      'against',
      'all',
      'am',
      'an',
      'and',
      'any',
      'are',
      "aren't",
      'as',
      'at',
      'be',
      'because',
      'been',
      'before',
      'being',
      'below',
      'between',
      'both',
      'but',
      'by',
      "can't",
      'cannot',
      'could',
      "couldn't",
      'did',
      "didn't",
      'do',
      'does',
      "doesn't",
      'doing',
      "don't",
      'down',
      'during',
      'each',
      'few',
      'for',
      'from',
      'further',
      'had',
      "hadn't",
      'has',
      "hasn't",
      'have',
      "haven't",
      'having',
      'he',
      "he'd",
      "he'll",
      "he's",
      'her',
      'here',
      "here's",
      'hers',
      'herself',
      'him',
      'himself',
      'his',
      'how',
      "how's",
      'i',
      "i'd",
      "i'll",
      "i'm",
      "i've",
      'if',
      'in',
      'into',
      'is',
      "isn't",
      'it',
      "it's",
      'its',
      'itself',
      "let's",
      'me',
      'more',
      'most',
      "mustn't",
      'my',
      'myself',
      'no',
      'nor',
      'not',
      'of',
      'off',
      'on',
      'once',
      'only',
      'or',
      'other',
      'ought',
      'our',
      'ours',
      'ourselves',
      'out',
      'over',
      'own',
      'same',
      "shan't",
      'she',
      "she'd",
      "she'll",
      "she's",
      'should',
      "shouldn't",
      'so',
      'some',
      'such',
      'than',
      'that',
      "that's",
      'the',
      'their',
      'theirs',
      'them',
      'themselves',
      'then',
      'there',
      "there's",
      'these',
      'they',
      "they'd",
      "they'll",
      "they're",
      "they've",
      'this',
      'those',
      'through',
      'to',
      'too',
      'under',
      'until',
      'up',
      'very',
      'was',
      "wasn't",
      'we',
      "we'd",
      "we'll",
      "we're",
      "we've",
      'were',
      "weren't",
      'what',
      "what's",
      'when',
      "when's",
      'where',
      "where's",
      'which',
      'while',
      'who',
      "who's",
      'whom',
      'why',
      "why's",
      'with',
      "won't",
      'would',
      "wouldn't",
      'you',
      "you'd",
      "you'll",
      "you're",
      "you've",
      'your',
      'yours',
      'yourself',
      'yourselves',
      "'n",
      'aan',
      'af',
      'al',
      'as',
      'baie',
      'by',
      'daar',
      'dag',
      'dat',
      'die',
      'dit',
      'een',
      'ek',
      'en',
      'gaan',
      'gesê',
      'haar',
      'het',
      'hom',
      'hulle',
      'hy',
      'in',
      'is',
      'jou',
      'jy',
      'kan',
      'kom',
      'ma',
      'maar',
      'met',
      'my',
      'na',
      'nie',
      'om',
      'ons',
      'op',
      'saam',
      'sal',
      'se',
      'sien',
      'so',
      'sy',
      'te',
      'toe',
      'uit',
      'van',
      'vir',
      'was',
      'wat',
      'ŉ'
    ];

    let res = [];
    const words = str.split(' ');
    let i;
    for (i = 0; i < words.length; i++) {
      let word_clean = words[i].split('.').join('');
      if (!stopwords.includes(word_clean)) {
        res.push(word_clean);
      }
    }
    return res.join(' ');
  }
}

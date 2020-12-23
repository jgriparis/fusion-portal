import { DataService } from 'src/app/core/shared/services/data.service';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { MediatypeComponent } from './../../../../analytics/components/mediatype/mediatype.component';
import { children } from './../../../../portal.routing';
import { ClientService } from 'src/app/core/clients/services/client.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NzFormatEmitEvent } from 'ng-zorro-antd/tree';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { cpuUsage } from 'process';

@Component({
  selector: 'app-client-type',
  templateUrl: './client-type.component.html',
  styleUrls: ['./client-type.component.css']
})
export class ClientTypeComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  nodes: any;
  subscription: Subscription;

  constructor(private readonly clientService: ClientService, private data: DataService) {
    const clientid = sessionStorage.getItem('clientId');

    this.subscription = this.data
      .getModalVisible()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((vis) => {
        const clientid = sessionStorage.getItem('clientId');

        this.clientService
          .getClient(clientid)
          .pipe(takeUntil(this.ngDestroy$))
          .subscribe((res) => {
            this.getTree(res[0]);
          });
      });

    this.clientService
      .getClient(clientid)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        this.getTree(res[0]);
      });
  }

  ngOnInit(): void {}

  getTree(clientResult) {
    let types = [];

    clientResult.clienttypes.forEach((d) => {
      let tkeyval = d.type.typeName.charAt(0) + d.type.id;
      let countries = [];
      let cParent = [];

      d.clientcountries.forEach((c) => {
        let ckeyval = tkeyval + `-C${c.country.id}`;
        let mediatypes = [];
        c.clientmediatypes.forEach((m) => {
          const keyval = `-M${m.mediatype.id}`;
          mediatypes.push({ title: m.mediatype.mediatypeName, key: ckeyval + keyval, isLeaf: true });
        });

        const pMediatypes = {
          title: 'Media Types',
          key: Math.random(),
          children: mediatypes
        };

        let brands = [];
        c.clientbrands.forEach((b) => {
          const keyval = `-B${b.brand.id}`;
          brands.push({ title: b.brand.brandName, key: ckeyval + keyval, isLeaf: true });
        });

        const pBrands = {
          title: 'Brands',
          key: Math.random(),
          children: brands
        };

        let categories = [];
        c.clientcategories.forEach((b) => {
          const keyval = `-X${b.category.id}`;
          categories.push({ title: b.category.categoryName, key: ckeyval + keyval, isLeaf: true });
        });

        const pCategories = {
          title: 'Categories',
          key: Math.random(),
          children: categories
        };

        let subcategories = [];
        c.clientsubcategories.forEach((b) => {
          const keyval = `-Y${b.subcategory.id}`;
          subcategories.push({ title: b.subcategory.subcategoryName, key: ckeyval + keyval, isLeaf: true });
        });

        const pSubCategories = {
          title: 'Sub-Categories',
          key: Math.random(),
          children: subcategories
        };

        let topics = [];
        c.clienttopics.forEach((b) => {
          const keyval = `-T${b.topic.id}`;
          topics.push({ title: b.topic.topicName, key: ckeyval + keyval, isLeaf: true });
        });

        const pTopics = {
          title: 'Topics',
          key: Math.random(),
          children: topics
        };

        let subscriptions = [];
        c.clientsubscriptions.forEach((b) => {
          const keyval = `-S${b.subscription.id}`;
          subscriptions.push({ title: b.subscription.subscriptionName, key: ckeyval + keyval, isLeaf: true });
        });

        const pSubscriptions = {
          title: 'Subscription',
          key: Math.random(),
          children: subscriptions
        };

        cParent.push(pMediatypes);
        cParent.push(pBrands);
        cParent.push(pCategories);
        cParent.push(pSubCategories);
        cParent.push(pTopics);
        cParent.push(pSubscriptions);

        countries.push({ title: c.country.countryName, key: ckeyval, children: cParent });

        cParent = [];
      });

      types.push({ title: d.type.typeName, key: tkeyval, children: countries });
    });

    this.nodes = JSON.parse(JSON.stringify(types));
  }

  nzEvent(event: NzFormatEmitEvent): void {
    let selectedNode = [];
    for (const key of Object.keys(event.keys)) {
      selectedNode.push({
        data: event.keys[key]
      });
    }

    sessionStorage.setItem('selectedNodes', JSON.stringify(selectedNode));
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}

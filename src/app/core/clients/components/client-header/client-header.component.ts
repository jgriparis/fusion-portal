import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/core/shared/services/data.service';
import { ClientService } from '../../services/client.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-client-header',
  templateUrl: './client-header.component.html',
  styleUrls: ['./client-header.component.css']
})
export class ClientHeaderComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  singledropdownSettings = {};
  listOfClient = [];
  selectedClient = [];
  subscription: Subscription;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private cfr: ComponentFactoryResolver,
    private readonly clientService: ClientService,
    private data: DataService
  ) {
    this.subscription = this.data
      .getClientUpdated()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((filt) => {
        this.errorMessage(filt);
        this.getClients();
        this.viewContainerRef.clear();
        this.selectedClient = [];
      });

    this.data.changeNav('Clients');
  }

  async getClient(item: any) {
    sessionStorage.setItem('clientId', item.item_id);
    this.viewContainerRef.clear();
    const { ClientComponent } = await import('../client/client.component');
    this.viewContainerRef.createComponent(this.cfr.resolveComponentFactory(ClientComponent));
  }

  ngOnInit(): void {
    this.singledropdownSettings = {
      singleSelection: true,
      primaryKey: 'item_id',
      labelKey: 'item_text',
      enableSearchFilter: true,
      maxHeight: 250,
      lazyLoading: true,
      text: 'Please select a client'
    };

    this.getClients();
  }

  getClients() {
    this.clientService
      .getClients()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const arrResult = [];
        res.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.clientName }));
        this.listOfClient = JSON.parse(JSON.stringify(arrResult));
      });
  }

  async createClient() {
    sessionStorage.setItem('clientId', '0');
    this.selectedClient = [];
    this.viewContainerRef.clear();
    const { ClientComponent } = await import('../client/client.component');
    this.viewContainerRef.createComponent(this.cfr.resolveComponentFactory(ClientComponent));
  }

  errorMessage(errMessage) {
    let message = ' ';
    const errorDiv = document.querySelector('.example-error');
    const messageDiv = errorDiv.querySelector('.message');

    message += errMessage;

    errorDiv.classList.remove('inactive');
    messageDiv.innerHTML = message;
    window.setTimeout(() => {
      errorDiv.classList.add('inactive');
      messageDiv.innerHTML = '';
    }, 3000);
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}

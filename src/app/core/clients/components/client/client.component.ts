import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/core/shared/services/data.service';
import { ClientService } from '../../services/client.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedService } from 'src/app/core/shared/services/shared.service';
import { ClientModel } from 'src/app/core/shared/models/client';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CountryModel } from 'src/app/core/shared/models/country';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  @ViewChild('logoInput', { static: true }) logoInput;
  clientForm: FormGroup;
  dropdownSettings = {};
  listOfType = [];
  selTypes = [];
  imageSrc: any;
  newClient = true;
  client = new ClientModel();
  logoName: string;
  subscription: Subscription;
  countryModel = new CountryModel();
  isVisibleTop = false;

  get typesFormArray() {
    return this.clientForm.controls.types as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private readonly clientService: ClientService,
    private readonly sharedService: SharedService,
    private data: DataService,
    private sanitizer: DomSanitizer
  ) {
    this.subscription = this.data
      .getModalVisible()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((vis) => {
        const clientid = sessionStorage.getItem('clientId');
        this.isVisibleTop = vis;
      });

    this.clientForm = this.fb.group({
      types: new FormArray([]),
      editorial_mediatypes: new FormArray([]),
      editorial_subscriptions: new FormArray([]),
      editorial_countries: new FormArray([]),
      advertising_mediatypes: new FormArray([]),
      advertising_subscriptions: new FormArray([]),
      advertising_countries: new FormArray([]),
      drpBrand: [null],
      drpCategory: [null],
      drpSubCategory: [null],
      drpTopic: [null],
      drpAdvertisingType: [null],
      clientname: new FormControl('', Validators.required),
      contactname: new FormControl('', Validators.required),
      logo: new FormControl(''),
      telephone: new FormControl(''),
      contactcompany: new FormControl('', Validators.required),
      contactjob: new FormControl(''),
      contactemail: new FormControl('', [Validators.required, Validators.email]),
      contacttelephone: new FormControl(''),
      contactmobile: new FormControl(''),
      fileSource: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: false,
      primaryKey: 'item_id',
      labelKey: 'item_text',
      filterSelectAllText: 'Select All',
      filterUnSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      enableCheckAll: true,
      enableFilterSelectAll: true,
      text: 'Please select one/many',
      maxHeight: 250,
      lazyLoading: true
    };

    this.getClientData();
  }

  get f() {
    return this.clientForm.controls;
  }

  getClientData() {
    this.clientForm.reset();
    const clientid = sessionStorage.getItem('clientId');

    if (clientid == '0') {
      this.newClient = true;

      this.sharedService
        .getTypes()
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe((res) => {
          res.forEach((d) => this.listOfType.push({ id: d.id, name: d.typeName, isChecked: false }));
          this.listOfType.forEach(() => this.typesFormArray.push(new FormControl(false)));
        });
      return;
    }

    this.newClient = false;

    this.clientService
      .getClientTypes(clientid)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        res.forEach((d) =>
          this.listOfType.push({
            id: d.id,
            name: d.typeName,
            isChecked: d.clienttypes.length > 0 ? true : false
          })
        );
        this.listOfType.forEach(() => this.typesFormArray.push(new FormControl(false)));
      });

    this.clientService
      .getClient(clientid)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        this.clientForm.patchValue({
          clientname: res[0].clientName,
          contactname: res[0].contactName,
          // logo: new FormControl(''),
          file: new FormControl(''),
          telephone: res[0].telephone,
          contactcompany: res[0].contactCompany,
          contactjob: res[0].contactJobTitle,
          contactemail: res[0].contactEmail,
          contacttelephone: res[0].contactTelephone,
          contactmobile: res[0].contactMobile
        });

        if (res[0].logo) {
          this.sharedService
            .getImage(res[0].logo)
            .pipe(takeUntil(this.ngDestroy$))
            .subscribe((data) => {
              const objectURL = URL.createObjectURL(data);
              this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            });
        }
      });
  }

  onSelectFile(file: FileList) {
    const formData = new FormData();
    formData.append('image', this.logoInput.nativeElement.files[0]);

    this.sharedService
      .uploadImage(formData)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((img) => {
        this.logoName = img.data.filename;
        this.sharedService
          .getImage(img.data.filename)
          .pipe(takeUntil(this.ngDestroy$))
          .subscribe((data) => {
            const objectURL = URL.createObjectURL(data);
            this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          });
      });
  }

  handleOkTop(): void {
    this.isVisibleTop = false;
  }

  handleCancelTop(): void {
    this.isVisibleTop = false;
  }

  AddCountry(): void {
    this.data.ChangeCountrySelection(1);
    this.isVisibleTop = true;
  }

  onDeleteNode() {
    const clientid = Number(sessionStorage.getItem('clientId'));
    const selectedNodes = JSON.parse(sessionStorage.getItem('selectedNodes'));

    selectedNodes.forEach((n) => {
      let mNode = '{';
      const nodeData = n.data.split('-');
      nodeData.forEach((d) => {
        switch (d.charAt(0)) {
          case 'A':
            mNode += `"typeId": 2,`;
            break;
          case 'E':
            mNode += `"typeId": 1,`;
            break;
          case 'C':
            mNode += `"countryId": ${Number(d.charAt(1))},`;
            break;
          case 'M':
            mNode += `"nodeType": "${d.charAt(0)}",`;
            mNode += `"nodeId": ${Number(d.charAt(1))}`;
            break;
          case 'B':
            mNode += `"nodeType": "${d.charAt(0)}",`;
            mNode += `"nodeId": ${Number(d.charAt(1))}`;
            break;
          case 'X':
            mNode += `"nodeType": "${d.charAt(0)}",`;
            mNode += `"nodeId": ${Number(d.charAt(1))}`;
            break;
          case 'Y':
            mNode += `"nodeType": "${d.charAt(0)}",`;
            mNode += `"nodeId": ${Number(d.charAt(1))}`;
            break;
          case 'T':
            mNode += `"nodeType": "${d.charAt(0)}",`;
            mNode += `"nodeId": ${Number(d.charAt(1))}`;
            break;
          case 'S':
            mNode += `"nodeType": "${d.charAt(0)}",`;
            mNode += `"nodeId": ${Number(d.charAt(1))}`;
            break;
          default:
            break;
        }
      });
      mNode += '}';
      this.clientService.removeNodeFromClient(clientid, JSON.parse(mNode)).pipe(takeUntil(this.ngDestroy$)).subscribe();
    });

    this.data.changeModalVisible(false);
  }

  submitForm(): void {
    if (this.clientForm.invalid) {
      return;
    }

    const clientid = sessionStorage.getItem('clientId');
    let newClientId = 0;

    this.client.clientName = this.clientForm.get('clientname').value;
    this.client.contactName = this.clientForm.get('contactname').value;
    this.client.telephone = this.clientForm.get('telephone').value;
    this.client.contactCompany = this.clientForm.get('contactcompany').value;
    this.client.contactJobTitle = this.clientForm.get('contactjob').value;
    this.client.contactEmail = this.clientForm.get('contactemail').value;
    this.client.contactTelephone = this.clientForm.get('contacttelephone').value;
    this.client.contactMobile = this.clientForm.get('contactmobile').value;
    this.client.logo = this.logoName;

    const selectedTypes = this.clientForm.value.types
      .map((checked, i) => (checked ? { id: this.listOfType[i].id, typeName: this.listOfType[i].name } : null))
      .filter((v) => v !== null);

    const linkedBrand = this.clientForm.get('drpBrand').value == null ? [] : this.clientForm.get('drpBrand').value;
    const linkedCategory =
      this.clientForm.get('drpCategory').value == null ? [] : this.clientForm.get('drpCategory').value;
    const linkedSubCategory =
      this.clientForm.get('drpSubCategory').value == null ? [] : this.clientForm.get('drpSubCategory').value;
    const linkedTopic = this.clientForm.get('drpTopic').value == null ? [] : this.clientForm.get('drpTopic').value;

    const clientBrands = [];
    const clientCategories = [];
    const clientSubCategories = [];
    const clientTopics = [];

    linkedBrand.forEach((l) => clientBrands.push({ brandId: l.item_id }));
    linkedCategory.forEach((l) => clientCategories.push({ categoryId: l.item_id }));
    linkedSubCategory.forEach((l) => clientSubCategories.push({ subcategoryId: l.item_id }));
    linkedTopic.forEach((l) => clientTopics.push({ topicId: l.item_id }));

    if (clientid == '0') {
      this.clientService
        .createClient(this.client)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe((data) => {
          newClientId = data.id;
        });

      selectedTypes.forEach((t) =>
        this.clientService.assignClientToType({ clientId: newClientId, typeId: Number(t.id) }).subscribe()
      );

      this.data.ChangeClientUpdated('Client successfully created');
      this.clientForm.reset();
    } else {
      const existClientId = Number(clientid);

      this.client.id = existClientId;
      this.clientService.updateClient(this.client).pipe(takeUntil(this.ngDestroy$)).subscribe();

      selectedTypes.forEach((t) =>
        this.clientService.assignClientToType({ clientId: existClientId, typeId: Number(t.id) }).subscribe()
      );

      this.data.ChangeClientUpdated('Client successfully updated');
      this.clientForm.reset();
    }
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}

import { SharedService } from 'src/app/core/shared/services/shared.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CountryModel } from 'src/app/core/shared/models/country';
import { DataService } from 'src/app/core/shared/services/data.service';
import { ClientService } from '../../services/client.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-add-country',
  templateUrl: './add-country.component.html',
  styleUrls: ['./add-country.component.css']
})
export class AddCountryComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  countryForm: FormGroup;
  loadContent = false;
  listOfType: string[] = [];
  listOfMediaType: string[] = [];
  listOfCountry: string[] = [];
  listOfSubscription: string[] = [];
  listOfBrand: string[] = [];
  listOfCategory: string[] = [];
  listOfSubCategory: string[] = [];
  listOfTopic: string[] = [];
  type = 'type';
  country = 'country';
  brand = 'brand';
  category = 'category';
  subcategory = 'subcategory';
  topic = 'topic';
  mediatype = 'mediatype';
  subscription = 'subscription';
  subs: Subscription;
  countryModel = new CountryModel();
  dropdownSettings = {};
  multidropdownSettings = {};

  constructor(
    private fb: FormBuilder,
    private readonly clientService: ClientService,
    private readonly sharedService: SharedService,
    private data: DataService
  ) {
    this.countryForm = this.fb.group({
      type: new FormControl('', Validators.required),
      country: new FormControl('', Validators.required),
      mediatype: new FormControl('', Validators.required),
      brand: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      subcategory: new FormControl('', Validators.required),
      topic: new FormControl('', Validators.required),
      subscription: new FormControl('', Validators.required)
    });
    this.loadContent = true;
  }

  get f() {
    return this.countryForm.controls;
  }

  ngOnInit(): void {
    this.dropdownSettings = {
      singleSelection: true,
      primaryKey: 'item_id',
      labelKey: 'item_text',
      enableSearchFilter: true,
      maxHeight: 250,
      lazyLoading: true,
      text: 'Please select one'
    };

    this.multidropdownSettings = {
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

    this.clientService
      .getTypes()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const arrResult = [];
        res.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.typeName }));
        this.listOfType = JSON.parse(JSON.stringify(arrResult));
      });

    this.clientService
      .getCountries()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const arrResult = [];
        res.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.countryName }));
        this.listOfCountry = JSON.parse(JSON.stringify(arrResult));
      });

    this.clientService
      .getSubscriptions()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const arrResult = [];
        res.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.subscriptionName }));
        this.listOfSubscription = JSON.parse(JSON.stringify(arrResult));
      });

    this.sharedService
      .getBrands()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const arrResult = [];
        res.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.brandName }));
        this.listOfBrand = JSON.parse(JSON.stringify(arrResult));
      });

    this.sharedService
      .getCategories()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const arrResult = [];
        res.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.categoryName }));
        this.listOfCategory = JSON.parse(JSON.stringify(arrResult));
      });

    this.sharedService
      .getSubcategories()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const arrResult = [];
        res.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.subcategoryName }));
        this.listOfSubCategory = JSON.parse(JSON.stringify(arrResult));
      });

    this.sharedService
      .getTopics()
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const arrResult = [];
        res.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.topicName }));
        this.listOfTopic = JSON.parse(JSON.stringify(arrResult));
      });
  }

  onTypeSelect(e) {
    this.clientService
      .getMediaTypesByType(e.item_id)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        const arrResult = [];
        res.forEach((d) => arrResult.push({ item_id: d.id, item_text: d.mediatypeName }));
        this.listOfMediaType = JSON.parse(JSON.stringify(arrResult));
      });
  }

  submitForm(): void {
    const clientid = sessionStorage.getItem('clientId');

    const selectedType = this.countryForm.get('type').value;
    const selectedCountry = this.countryForm.get('country').value;
    const selectedSubscription = this.countryForm.get('subscription').value;
    const selectedMediaTypes = this.countryForm.get('mediatype').value;
    const selectedBrands = this.countryForm.get('brand').value;
    const selectedCategories = this.countryForm.get('category').value;
    const selectedSubcategories = this.countryForm.get('subcategory').value;
    const selectedTopics = this.countryForm.get('topic').value;

    const clientMediaTypes = [];
    selectedMediaTypes.forEach((l) => clientMediaTypes.push({ mediatypeId: l.item_id }));
    const clientBrands = [];
    selectedBrands.forEach((l) => clientBrands.push({ brandId: l.item_id }));
    const clientCategories = [];
    if (selectedCategories) selectedCategories.forEach((l) => clientCategories.push({ categoryId: l.item_id }));
    const clientSubcategories = [];
    if (selectedSubcategories)
      selectedSubcategories.forEach((l) => clientSubcategories.push({ subcategoryId: l.item_id }));
    const clientTopics = [];
    if (selectedTopics) selectedTopics.forEach((l) => clientTopics.push({ topicId: l.item_id }));

    this.countryModel.countryId = selectedCountry[0].item_id;
    this.countryModel.subscriptionId = selectedSubscription[0].item_id;
    this.countryModel.mediatypes = clientMediaTypes;
    this.countryModel.brands = clientBrands;
    this.countryModel.categories = clientCategories;
    this.countryModel.subcategories = clientSubcategories;
    this.countryModel.topics = clientTopics;
    this.countryModel.typeId = selectedType[0].item_id;

    this.clientService
      .assignClientToCountry(Number(clientid), this.countryModel)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((res) => {
        this.data.changeModalVisible(false);
      });
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}

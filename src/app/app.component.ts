import { AppHelperCommponent, ModalMessage, ToastMessage } from './apphelper/apphelper';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Component, ElementRef, OnInit, ViewChild, Pipe } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms'
import { debounceTime } from 'rxjs/operators';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

//declare let ClientIP: any;

@Component({
  selector: 'app-root',
  // tslint:disable-next-line:max-line-length
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService, AppHelperCommponent]
})

export class AppComponent implements OnInit {
  pornlist: any = [];
  pornlistFilter: any = [];
  _selectItem: any;
  _state: string = '';
  _singer: string = '';
  _songname: string = '';
  _link: string = '';
  pagebackgroundImg: string;
  displaypopuup = false;
  _error = '';

  notice: any;
  searchField: FormControl;
  // @ViewChild('snowfallbackground') snowfallbackground: SnowfallbackgroundComponent;

  constructor(public apphelper: AppHelperCommponent, private router: Router, private route: ActivatedRoute, private confirmationService: ConfirmationService, private deviceService: DeviceDetectorService, private firestore: AngularFirestore) {
    //console.log(environment);
  }

  async ngOnInit() {
    //this.apphelper.ShowLoading();

    //console.log('call app ngOnInit');
    // if (this.apphelper.CurrentDate().substr(4, 4) == '1225') {
    //   this.snowfallbackground.ShowSnowFall();
    // }
    // this.pornlist = await this.apphelper.ApiGet('./assets/song.json?version=' + new Date().getTime());

    this.searchField = new FormControl();
    this.searchField.valueChanges.pipe(debounceTime(1000)).subscribe(search => {
      this.Search(search);
    });

    this.pornlist = [];
    await this.LoadSong();

    //console.log(this.pornlist);
  }

  async LoadSong() {
    //return [];
    this.apphelper.ShowLoading();

    await this.firestore.collection('pornlist').snapshotChanges().subscribe(data => {
      //console.log('test');
      this.pornlist = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        };
      });
      //console.log(this.pornlist);
      this.Search('');
      this.apphelper.HideLoading();
    });



    //return x;

    // let x = this.firestore.collection('pornlist').valueChanges();

  }

  Showpornlist() {
    return this.apphelper.Sort(this.pornlistFilter, "singer");
  }

  Search(filter: string): any {
    //console.log(filter);
    //console.log(this.menuShow);
    this.apphelper.ShowLoading();

    if (filter !== '') {
      this.pornlistFilter = this.pornlist.filter(data => data.singer.indexOf(filter) > -1 || data.songname.indexOf(filter) > -1);
    } else {
      this.pornlistFilter = this.pornlist;
    }

    this.apphelper.HideLoading();

    //console.log(this.menuShowFilter);
  }

  Add() {
    this._state = this.apphelper.Add;
    this._songname = '';
    this._link = '';
    this._singer = '';
    this._error = '';

    setTimeout(() => this.displaypopuup = true);
    // ;
  }

  Edit() {
    if (this.apphelper.IsNull(this._selectItem))
      return;

    this._state = this.apphelper.Edit;
    this._songname = this._selectItem.songname;
    this._link = this._selectItem.link;
    this._singer = this._selectItem.singer;
    this.displaypopuup = true;
  }

  // Del() {
  //   //console.log(this._selectItem);
  //   if (this.apphelper.IsNull(this._selectItem))
  //     return;

  //   this.confirmationService.confirm({
  //     message: 'คุณต้องการลบข้อมูล ' + this._selectItem.songname + ' ใช่หรือไม่ ?',
  //     header: 'Cancel Confirm',
  //     accept: async () => {
  //       this.firestore.doc('pornlist/' + this._selectItem.id).delete();
  //       await this.LoadSong();
  //     }
  //   });
  // }

  async SaveSong() {
    //console.log('xx');
    this._error = '';
    this.apphelper.ShowLoading();
    let result = await this.apphelper.ApiGet("https://api.linkpreview.net/?key=28bc6f6a155e54f8daa339b935fdef53&q=" + this._link);
    console.log("https://api.linkpreview.net/?key=28bc6f6a155e54f8daa339b935fdef53&q=" + this._link);

    this.apphelper.HideLoading();

    //console.log(result);
    //console.log(result.ok);

    if (this.apphelper.IsNull(result.ok)) {
      //console.log('ok');
      this.firestore.collection('pornlist').add({ "description": result.description, "url": result.url, "image": result.image, "title": result.title });

      await this.LoadSong();

      // if (result.error)
      //   this.apphelper.ShowError(result.error);
      // else
      //   console.log(result);
      this.displaypopuup = false;
    } else {
      //console.log('error');
      this._error = result.message;
    }
  }

  async Del(item) {
    //console.log('xx');

    this.confirmationService.confirm({
      message: 'คุณต้องการลบข้อมูล ' + item.title + ' ใช่หรือไม่ ?',
      header: 'Cancel Confirm',
      accept: async () => {
        this.firestore.doc('pornlist/' + item.id).delete();
        await this.LoadSong();
      }
    });
  }

}

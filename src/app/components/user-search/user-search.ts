import { Component, inject, OnInit } from '@angular/core';
import { UserCard } from '../user-card/user-card';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { UserSearchService } from '../../services/user-search-service';
import { UserInstrumentsService } from '../../services/user-instruments-service';
import { UserGenresService } from '../../services/user-genres-service';
import { MusicBrainzService } from '../../services/bands-service';

@Component({
  selector: 'app-user-search',
  imports: [UserCard, ClickOutsideDirective],
  templateUrl: './user-search.html',
  styleUrl: './user-search.css',
  providers: [],
})
export class UserSearch implements OnInit {
  readonly userSearchService = inject(UserSearchService);
  readonly userInstrumentService = inject(UserInstrumentsService);
  readonly userGenresService = inject(UserGenresService);
  readonly musicBrainzService = inject(MusicBrainzService);

  ngOnInit() {
    this.userSearchService.initRandomUsers();

    if (this.userSearchService.selectedInstruments().length > 0) {
      this.userSearchService.search();
    } else {
      this.userSearchService.initRandomUsers();
    }
  }
}

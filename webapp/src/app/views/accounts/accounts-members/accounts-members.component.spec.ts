import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsMembersComponent } from './accounts-members.component';

describe('AccountsMembersComponent', () => {
  let component: AccountsMembersComponent;
  let fixture: ComponentFixture<AccountsMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsMembersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopCreate } from './shop-create';

describe('ShopCreate', () => {
  let component: ShopCreate;
  let fixture: ComponentFixture<ShopCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopCreate],
    }).compileComponents();

    fixture = TestBed.createComponent(ShopCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

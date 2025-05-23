import { TestBed } from '@angular/core/testing';
import { EditModeService } from './edit-mode.service';

describe('EditModeService', () => {
  let service: EditModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditModeService]
    });

    service = TestBed.inject(EditModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have edit mode off by default', () => {
    expect(service.isEditMode()).toBeFalse(); // default es false
  });

  it('should enable edit mode when setEditMode(true) is called', () => {
    service.setEditMode(true);
    expect(service.isEditMode()).toBeTrue();
  });

  it('should disable edit mode when setEditMode(false) is called', () => {
    service.setEditMode(true);  // primero lo activamos
    service.setEditMode(false); // luego lo desactivamos
    expect(service.isEditMode()).toBeFalse();
  });
});

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EditModeService {
  _isEditMode = signal(false);  // Signal interna
  isEditMode = this._isEditMode.asReadonly();

  setEditMode(isEdit: boolean): void {
    this._isEditMode.set(isEdit);
  }
}

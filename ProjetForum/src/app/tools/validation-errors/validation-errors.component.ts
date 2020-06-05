import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-validation-errors',
  templateUrl: './validation-errors.component.html',
  styleUrls: ['./validation-errors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationErrorsComponent {
  @Input() errors: ValidationErrors;

}

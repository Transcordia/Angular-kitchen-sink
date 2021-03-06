
// blog: https://netbasal.com/angular-the-ngstyle-directive-under-the-hood-2ed720fb9b61#.i54jtkadu

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, DoCheck, ElementRef, Input, KeyValueChangeRecord, KeyValueDiffer, KeyValueDiffers, Renderer} from '@angular/core';

/**
 * @ngModule CommonModule
 *
 * @whatItDoes Update an HTML element styles.
 *
 * @howToUse
 * ```
 * <some-element [ngStyle]="{'font-style': styleExp}">...</some-element>
 *
 * <some-element [ngStyle]="{'max-width.px': widthExp}">...</some-element>
 *
 * <some-element [ngStyle]="objExp">...</some-element>
 * ```
 *
 * @description
 *
 * The styles are updated according to the value of the expression evaluation:
 * - keys are style names with an optional `.<unit>` suffix (ie 'top.px', 'font-style.em'),
 * - values are the values assigned to those properties (expressed in the given unit).
 *
 * @stable
 */
@Directive({selector: '[ngStyleCustom]'})
export class NgStyle implements DoCheck {
    private _ngStyle: {[key: string]: string};
    private _differ: KeyValueDiffer;

    constructor(
        private _differs: KeyValueDiffers, private _ngEl: ElementRef, private _renderer: Renderer) {}

    @Input()
    set ngStyle(v: {[key: string]: string}) {
        this._ngStyle = v;
        if (!this._differ && v) {
            this._differ = this._differs.find(v).create(null);
        }
    }

    ngDoCheck() {
        if (this._differ) {
            const changes = this._differ.diff(this._ngStyle);
            if (changes) {
                this._applyChanges(changes);
            }
        }
    }

    private _applyChanges(changes: any): void {
        changes.forEachRemovedItem((record: KeyValueChangeRecord) => this._setStyle(record.key, null));

        changes.forEachAddedItem(
            (record: KeyValueChangeRecord) => this._setStyle(record.key, record.currentValue));

        changes.forEachChangedItem(
            (record: KeyValueChangeRecord) => this._setStyle(record.key, record.currentValue));
    }

    private _setStyle(nameAndUnit: string, value: string): void {
        const [name, unit] = nameAndUnit.split('.');
        value = value && unit ? `${value}${unit}` : value;

        this._renderer.setElementStyle(this._ngEl.nativeElement, name, value);
    }
}
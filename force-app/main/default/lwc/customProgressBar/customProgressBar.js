import { LightningElement, api } from 'lwc';

export default class CustomProgressBar extends LightningElement {
    @api currentValue;
    @api maxValue;
    @api isRing;
    @api isCurrency;
    @api color;

    get progressPercentage() {
        return Math.min((this.currentValue / this.maxValue) * 100, 100).toFixed(0);
    }

    get currentValueFormatted() {
        return this.isCurrency == true ? `$${this.currentValue.toLocaleString()}` : `${this.currentValue.toLocaleString()}`;
    }

    get maxValueFormatted() {
        return this.isCurrency == true ? `$${this.maxValue.toLocaleString()}` : `${this.maxValue.toLocaleString()}`;
    }

    get dashArray() {
        const percent = this.progressPercentage;
        return `${percent}, 100`;
    }

    renderedCallback() {
        const progressBarElement = this.template.querySelector('.slds-progress-bar__value');
        if(progressBarElement) {
            progressBarElement.style.width = `${this.progressPercentage}%`;
            progressBarElement.style.background = `${this.color}`;
        }
    }
}
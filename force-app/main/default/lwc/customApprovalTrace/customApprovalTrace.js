import { LightningElement, wire, api } from 'lwc';
import userId from '@salesforce/user/Id';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';
import { refreshApex } from '@salesforce/apex';
import getApprovalWorkItems from '@salesforce/apex/CustomApprovalTraceController.getApprovalWorkItems';

export default class CustomApprovalTrace extends LightningElement {
    records;
    sortedData;
    error;
    columns;
    wiredResult;

    isFlowModalOpen = false;
    flowInputVariables = [];

    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortedBy;

    @api recordId;
    userId = userId;
    @api itemsToShow;
    @api label;

    channelName = '/event/ApprovalWorkItem_Created__e';
    subscription = null;

    constructor() {
        super();
        this.columns = [
            { label: 'Related To', fieldName: 'relatedToUrl', type: 'url', typeAttributes: {label: { fieldName: 'relatedToName' }, target: '_blank'}, 
                hideDefaultActions: true, initialWidth: 150, sortable: true, sortBy: 'relatedToName' },
            { label: 'Status', fieldName: 'Status', 
                hideDefaultActions: true, initialWidth: 150, sortable: true, sortBy: 'Status' },
            //{ label: 'Request Details', fieldName: 'Request_Details__c', 
                //hideDefaultActions: true, initialWidth: 150, sortable: true, sortBy: 'Request_Details__c' },
            { label: 'Assigned To', fieldName: 'assignedToUrl', type: 'url', typeAttributes: {label: { fieldName: 'assignedToName' }, target: '_blank'}, 
                hideDefaultActions: true, initialWidth: 150, sortable: true, sortBy: 'assignedToName' },
            { label: 'Requested Date', fieldName: 'CreatedDate', type: 'date', typeAttributes:{hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric"},
                hideDefaultActions: true, initialWidth: 150, sortable: true, sortBy: 'CreatedDate' },
            { label: 'Reviewed Date', fieldName: 'ReviewedDate', type: 'date', typeAttributes:{hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric"},
                hideDefaultActions: true, initialWidth: 150, sortable: true, sortBy: 'ReviewedDate' },
            { label: 'Reviewed By', fieldName: 'reviewedByUrl', type: 'url', typeAttributes: {label: { fieldName: 'reviewedByName' }, target: '_blank'}, 
                hideDefaultActions: true, initialWidth: 150, sortable: true, sortBy: 'reviewedByName' },
            { label: 'Requested By', fieldName: 'submittedByUrl', type: 'url', typeAttributes: {label: { fieldName: 'submittedByName' }, target: '_blank'}, 
                hideDefaultActions: true, initialWidth: 150, sortable: true, sortBy: 'submittedByName' },
            { label: 'Comments', fieldName: 'Comments', 
                hideDefaultActions: true, initialWidth: 150, sortable: true, sortBy: 'Comments' },
            { label: 'Name', fieldName: 'nameUrl', type: 'url', typeAttributes: {label: { fieldName: 'Name' }, target: '_blank'}, 
                hideDefaultActions: true, initialWidth: 150, sortable: true, sortBy: 'Name' },
            { type: 'action', typeAttributes: { rowActions: this.getRowActions } },
        ]
    }

    getRowActions(row, doneCallback) {
        const actions = [];
            if (!['Approved', 'Rejected'].includes(row['Status'])) {
                actions.push({
                    'label': 'Review',
                    'name': 'launch_review_flow'
                });
                actions.push({
                    'label': 'Recall',
                    'name': 'launch_recall_flow'
                });
            } else {
                actions.push({
                    'label': 'No actions for this record',
                    'name': '',
                    'disabled': true
                });
            }
            // simulate a trip to the server
            setTimeout(() => {
                doneCallback(actions);
            }, 200);
    }

    connectedCallback() {
        if(this.recordId == undefined) {
            this.recordId = null;
        }
        console.log('Record Id (if on record page): ' + this.recordId + ' & Running User Id: ' + this.userId);

        if(this.itemsToShow == undefined) {
            this.itemsToShow = 'Assigned Only';
        }

        if(this.label == undefined) {
            this.label = 'Items to Approve';
        }

        this.handleSubscribe();
        onError(error => {
            console.error('EMP API error:', JSON.stringify(error));
        });
    }

    disconnectedCallback() {
        this.handleUnsubscribe();
    }

    handleSubscribe() {
        const messageCallback = (response) => {
            const createdRecordId = response.data.payload.Related_Record_Id__c;
            if (createdRecordId === this.recordId) {
                console.log(`Match found for recordId: ${createdRecordId}`);
                this.refreshComponent(); // Run your refresh logic here
            }
        };

        subscribe(this.channelName, -1, messageCallback).then(response => {
            this.subscription = response;
            console.log('Subscribed to platform event:', response.channel);
        });
    }

    handleUnsubscribe() {
        if (this.subscription) {
            unsubscribe(this.subscription, response => {
                console.log('Unsubscribed from platform event:', response);
            });
        }
    }

    refreshComponent() {
        console.log('Triggering data refresh...');
        refreshApex(this.wiredResult);
    }

    @wire(getApprovalWorkItems, {recordId: '$recordId', userId: '$userId', itemsToShow: '$itemsToShow'})
    resultRecords(result) {
        this.wiredResult = result;
        if (result.data) {
            this.error = undefined;

            console.log(JSON.parse(JSON.stringify(result.data)));

            let nameUrl, relatedToUrl, relatedToName, reviewedByUrl, reviewedByName, submittedByUrl, submittedByName, assignedToUrl, assignedToName;
            this.records = result.data.map(row => {
                nameUrl = `/${row.Id}`;
                relatedToUrl = row.RelatedRecordId != null ? `/${row.RelatedRecordId}` : '';
                relatedToName = row.RelatedRecord?.Name != null ? row.RelatedRecord.Name : '';
                reviewedByUrl = row.ReviewedById != null ? `/${row.ReviewedById}` : '';
                reviewedByName = row.ReviewedById != null ? row.ReviewedBy.Name : '';
                submittedByUrl = row.ApprovalSubmission?.SubmittedById != null ? `/${row.ApprovalSubmission.SubmittedById}` : '';
                submittedByName = row.ApprovalSubmission?.SubmittedById != null ? row.ApprovalSubmission.SubmittedBy.Name : '';
                assignedToUrl = `/${row.AssignedToId}`;
                assignedToName = row.AssignedTo.Name;
                return {...row , nameUrl, relatedToUrl, relatedToName, reviewedByUrl, reviewedByName, submittedByUrl, submittedByName, assignedToUrl, assignedToName} 
            })

            console.log(JSON.parse(JSON.stringify(this.records)));

            this.sortData('Name', 'desc');
        } else if (result.error) {
            this.error = result.error;
            this.records = undefined;
            console.log('Error getting records: ' + JSON.stringify(this.error));
        }
    }

    sortData(fieldName, sortDirection) {
        let cloneData = [...this.records];
        cloneData.sort((a, b) => {
            let valueA = String(a[fieldName] || '').toLowerCase();
            let valueB = String(b[fieldName] || '').toLowerCase();
            //console.log(valueA);
            return sortDirection === 'asc'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        });

        this.sortedData = cloneData;
    }

    sortColumns(event) {
        var fieldName = this.columns.find(field=>event.detail.fieldName===field.fieldName).sortBy;
        //var fieldName = event.detail.fieldName;
        var sortDirection = event.detail.sortDirection;
        this.sortedBy = event.detail.fieldName;
        this.sortDirection = sortDirection;
        this.sortData(fieldName, sortDirection);
    }

    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        console.log(row.Id);

        if (action.name === 'launch_review_flow') {
            this.flowInputVariables = [
                {
                    name: 'actionType',
                    type: 'String',
                    value: 'review'
                },
                {
                    name: 'approvalWorkItemId',
                    type: 'String',
                    value: row.Id
                }
            ];
            this.isFlowModalOpen = true;
        }

        if (action.name === 'launch_recall_flow') {
            this.flowInputVariables = [
                {
                    name: 'actionType',
                    type: 'String',
                    value: 'recall'
                },
                {
                    name: 'approvalSubmissionId',
                    type: 'String',
                    value: row.ApprovalSubmissionId
                }
            ];
            this.isFlowModalOpen = true;
        }
    }

    closeFlowModal() {
        this.isFlowModalOpen = false;
    }

    handleFlowStatusChange(event) {
        if (event.detail.status === 'FINISHED' || event.detail.status === 'FINISHED_SCREEN') {
            this.isFlowModalOpen = false;
            // Optional: refresh your table here
        }
    }
}
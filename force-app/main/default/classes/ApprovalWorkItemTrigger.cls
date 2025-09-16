trigger ApprovalWorkItemTrigger on ApprovalWorkItem (after insert) {
    List<ApprovalWorkItem_Created__e> events = new List<ApprovalWorkItem_Created__e>();

    for (ApprovalWorkItem item : Trigger.new) {
        events.add(new ApprovalWorkItem_Created__e(
            Related_Record_Id__c = item.RelatedRecordId
        ));
    }

    if (!events.isEmpty()) {
        EventBus.publish(events);
    }
}

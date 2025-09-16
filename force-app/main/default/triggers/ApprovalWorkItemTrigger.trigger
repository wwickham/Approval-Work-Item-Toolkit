trigger ApprovalWorkItemTrigger on ApprovalWorkItem (after insert, after update) {
    List<ApprovalWorkItem_Created__e> events = new List<ApprovalWorkItem_Created__e>();

    for (ApprovalWorkItem item : Trigger.new) {
        if (Trigger.isInsert) {
            events.add(new ApprovalWorkItem_Created__e(
                Related_Record_Id__c = item.RelatedRecordId
            ));
        }

        if (Trigger.isUpdate) {
            ApprovalWorkItem oldItem = Trigger.oldMap.get(item.Id);
            if (item.Status != oldItem.Status) {
                events.add(new ApprovalWorkItem_Created__e(
                    Related_Record_Id__c = item.RelatedRecordId
                ));
            }
        }
    }

    if (!events.isEmpty()) {
        EventBus.publish(events);
    }
}

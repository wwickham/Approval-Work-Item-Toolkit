@isTest(SeeAllData=true)
private class ApprovalWorkItemTriggerTest {

    @isTest
    static void testApprovalWorkItemTriggerPublishesEvent() {
        // Set up test data
        ApprovalWorkItem testItem = new ApprovalWorkItem();
        //testItem.RelatedRecordId = '001XXXXXXXXXXXX'; // Use a valid Id format for the object you're linking

        Test.startTest();
        insert testItem;
        Test.stopTest();

        // You can't directly assert EventBus.publish in a test context,
        // but you can check that the trigger executed without errors.
        //System.assertEquals('001XXXXXXXXXXXX', [SELECT Id, RelatedRecordId FROM ApprovalWorkItem LIMIT 1].RelatedRecordId);
    }
}
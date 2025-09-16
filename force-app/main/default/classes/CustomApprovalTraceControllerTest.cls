@isTest(SeeAllData=True)
private class CustomApprovalTraceControllerTest {

    @isTest
    static void testGetApprovalWorkItems() {

        ApprovalWorkItem workItem = [SELECT Id, RelatedRecordId FROM ApprovalWorkItem LIMIT 1];

        Test.startTest();
        List<ApprovalWorkItem> result = CustomApprovalTraceController.getApprovalWorkItems(workItem.RelatedRecordId, '', 'Assigned Only');
        Test.stopTest();
    }

    @isTest
    static void testGetApprovalWorkItemsWithFilter() {

        ApprovalWorkItem workItem = [SELECT Id, RelatedRecordId FROM ApprovalWorkItem LIMIT 1];

        Test.startTest();
        List<ApprovalWorkItem> result = CustomApprovalTraceController.getApprovalWorkItems(workItem.RelatedRecordId, '', 'Completed');
        Test.stopTest();
    }

    @isTest
    static void testGetApprovalWorkItemsUser() {

        String currentUserId = UserInfo.getUserId();

        Test.startTest();
        List<ApprovalWorkItem> result = CustomApprovalTraceController.getApprovalWorkItems(null, currentUserId, 'Assigned Only');
        Test.stopTest();
    }
}
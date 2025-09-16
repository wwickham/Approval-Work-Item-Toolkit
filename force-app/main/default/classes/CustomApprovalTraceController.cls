public with sharing class CustomApprovalTraceController {
    @AuraEnabled(cacheable=true)
    public static List<ApprovalWorkItem> getApprovalWorkItems(Id recordId, String userId, String itemsToShow) {
        if (recordId == null) {
            Set<String> groupIds = new Set<String>();
            for (GroupMember groupMember : [SELECT GroupId FROM GroupMember WHERE UserOrGroupId = :userId]){
                groupIds.add(groupMember.GroupId);
            }
			//Query all parent groups in the hierarchy
			Boolean keepGoing = true;
            while (keepGoing) {
                keepGoing = false;

                for (GroupMember groupMember : [SELECT GroupId FROM GroupMember WHERE UserOrGroupId IN :groupIds]) {
                    if (!groupIds.contains(groupMember.GroupId)) {
                        groupIds.add(groupMember.GroupId);
                        keepGoing = true;
                    }
                }
            }

            String query = 'SELECT Id, Name, AssignedToId, AssignedTo.Name, Comments, CreatedDate, '
                + 'ReviewedById, ReviewedBy.Name, ReviewedDate, Status, RelatedRecordId, RelatedRecord.Name, ApprovalSubmissionId, '
                + 'Request_Details__c, '
                + 'ApprovalSubmission.SubmittedById, ApprovalSubmission.SubmittedBy.Name '
                + 'FROM ApprovalWorkItem '
                + 'WHERE (AssignedToId = :userId OR AssignedToId IN :groupIds)';
            
            switch on itemsToShow {
                when 'Assigned Only' {
                    query += ' AND (Status = \'Assigned\')';
                }
                when 'Completed' {
                    query += ' AND (Status = \'Approved\' OR Status = \'Rejected\')';
                }
                when else {
                    System.debug('default');
                }
            }
            return Database.query(query);
        } else {
            String query = 'SELECT Id, Name, AssignedToId, AssignedTo.Name, Comments, CreatedDate, '
                + 'ReviewedById, ReviewedBy.Name, ReviewedDate, Status, RelatedRecordId, RelatedRecord.Name, ApprovalSubmissionId, '
                + 'Request_Details__c, '
                + 'ApprovalSubmission.SubmittedById, ApprovalSubmission.SubmittedBy.Name '
                + 'FROM ApprovalWorkItem '
                + 'WHERE (RelatedRecordId = :recordId)';
            
            switch on itemsToShow {
                when 'Assigned Only' {
                    query += ' AND (Status = \'Assigned\')';
                }
                when 'Completed' {
                    query += ' AND (Status = \'Approved\' OR Status = \'Rejected\')';
                }
                when else {
                    System.debug('default');
                }
            }
            return Database.query(query);
        }
    }
}
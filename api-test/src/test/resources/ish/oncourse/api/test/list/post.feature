@parallel=false
Feature: Main feature for all POST requests with path 'list'

    Background: Authorize first
        * configure headers = { Authorization: 'admin' }
        * url 'https://127.0.0.1:8182/a/v1'
        * def ishPath = 'list'
        * def ishPathLogin = 'login'
        



    Scenario: (+) Get list for each entity by admin

        * table getListOfEntity

        | entity                |
        | 'Account'             |
        | 'AccountTransaction'  |
        | 'Audit'               |
        | 'Banking'             |
        | 'CorporatePass'       |
        | 'Discount'            |
        | 'AbstractInvoice'     |
        | 'Module'              |
        | 'Qualification'       |
        | 'Payslip'             |
        | 'Room'                |
        | 'Script'              |
        | 'Site'                |
        | 'Document'            |
        | 'WaitingList'         |
        | 'Application'         |
        | 'ArticleProduct'      |
        | 'MembershipProduct'   |
        | 'VoucherProduct'      |
        | 'Certificate'         |
        | 'Survey'              |
        | 'Outcome'             |
        | 'ProductItem'         |
        | 'Message'             |
        | 'Enrolment'           |
        | 'Assessment'          |
        | 'PaymentIn'           |
        | 'PaymentOut'          |
        | 'Course'              |
        | 'CourseClass'         |
        | 'Contact'             |
        | 'PriorLearning'       |

      * call read('postListOfEntity.feature') getListOfEntity


  Scenario: (+) Get list for each entity with filters

    * table getListOfEntity

      | entity                | request                                                                          |
      | 'Contact'             | {search: "isStudent == true", pageSize: 50, offset: 0, filter: "", tagGroups: []}|
      | 'Contact'             | {search: "cf1 not is null and cf2 is null", pageSize: 50, offset: 0, filter: "", tagGroups: []}|

    * call read('postListOfEntityWithFilters.feature') getListOfEntity



    Scenario: (+) Get list for each entity by notadmin with access rights View

        Given path '/logout'
        And request {}
        When method PUT
        
#       <---> Login as notadmin
        * configure headers = { Authorization:  'UserWithRightsDelete'}

        
#       <--->

        * table getListOfEntity

          | entity                |
          | 'Account'             |
          | 'AccountTransaction'  |
          | 'Audit'               |
          | 'Banking'             |
          | 'CorporatePass'       |
          | 'Discount'            |
          | 'AbstractInvoice'     |
          | 'Module'              |
          | 'Qualification'       |
          | 'Payslip'             |
          | 'Room'                |
          | 'Script'              |
          | 'Site'                |
          | 'Document'            |
          | 'WaitingList'         |
          | 'Application'         |
          | 'ArticleProduct'      |
          | 'MembershipProduct'   |
          | 'VoucherProduct'      |
          | 'Certificate'         |
          | 'Survey'              |
          | 'Outcome'             |
          | 'ProductItem'         |
          | 'Message'             |
          | 'Enrolment'           |
          | 'Assessment'          |
          | 'PaymentIn'           |
          | 'PaymentOut'          |
          | 'Course'              |
          | 'CourseClass'         |
          | 'Contact'             |
          | 'PriorLearning'       |

        * call read('postListOfEntity.feature') getListOfEntity



    Scenario: (+) Get list for each entity by notadmin with access rights Hide

        Given path '/logout'
        And request {}
        When method PUT
      
#       <--->  Login as notadmin
        * configure headers = { Authorization:  'UserWithRightsView'}

        
#       <--->

        * table getListOfEntity

          | entity                |
          | 'Audit'               |
          | 'Module'              |
          | 'Qualification'       |
          | 'Room'                |
          | 'Script'              |
          | 'Site'                |
          | 'Document'            |
          | 'Application'         |
          | 'ArticleProduct'      |
          | 'MembershipProduct'   |
          | 'VoucherProduct'      |
          | 'Survey'              |
          | 'ProductItem'         |
          | 'Message'             |
          | 'Assessment'          |
          | 'Course'              |
          | 'CourseClass'         |
          | 'Contact'             |

        * call read('postListOfEntity.feature') getListOfEntity



    Scenario: (-) Get list for each entity by notadmin without access rights

        Given path '/logout'
        And request {}
        When method PUT
          
#       <--->  Login as notadmin
        * configure headers = { Authorization:  'UserWithRightsHide'}

        
#       <--->

        * table getListOfEntity

          | entity                |
          | 'Account'             |
          | 'AccountTransaction'  |
          | 'Audit'               |
          | 'Banking'             |
          | 'CorporatePass'       |
          | 'Discount'            |
          | 'AbstractInvoice'     |
          | 'Payslip'             |
          | 'WaitingList'         |
          | 'Application'         |
          | 'Certificate'         |
          | 'Outcome'             |
          | 'Enrolment'           |
          | 'PaymentIn'           |
          | 'PaymentOut'          |
          | 'PriorLearning'       |

        * call read('postListOfEntityWithoutRights.feature') getListOfEntity


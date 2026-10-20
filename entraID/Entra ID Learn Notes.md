## 1. Overview [learn module](https://learn.microsoft.com/en-us/training/modules/intro-to-azure-ad/2-overview)
Eyes  email physical aspect of cybersecurity wireless signal analysis mesh nodes for crisis communication etc
- Azure: Everything cloud from Microsoft. Services like (VM, website, DB... integrated cloud applications)
- Microsoft Entra Application Proxy can be used to have on-premise apps represented as a cloud service allowing remote access
- Entra ID formerly Azure Active Directory (aad): cloud identity management system, allowing users access to external resources (Azure services, MS 365) and internal resources like the companys codebase/software tools. Structured by tenant per organization.
- Active Directory (DS Domain Service): On-Premise managing objects, users and devices. Authentication via Kerberos or NTLM. Structured in Forests, Domains, OUs. (DS is built into Microsoft server and allows storing and sharing directory data within the network to authorized users)
#### Hybrid Identity
AAD and AD can be combined in a hybrid approach to allow authentication of a user for both on premise and cloud apps.
Can be done via 1 of 3 methods.
1. Entra Password Hash Sync ([How it works](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-password-hash-synchronization#how-password-hash-synchronization-works)): Password Hash is expanded via PBKDF2 and result is sent to Entra ID 
2. Entra pass-through auth (PTA): Agent is installed on on-premise to authenticate Entra ID users against on-premise AD server.
3. Federated Authentication: ADFS server on-premise handles authentication. Can use extended features e.g. smartcard. Iris-scanner...

## 2. Structure
##### Tenant:
An instance of Entra ID. Usually represents an Organization. Each Tenant has a Directory that contains all Users and Groups with access to the service. A subscription to an Azure Service is charged to one Directory. A default directory is created for a Tenant but can create multiple directories/Tenants. Default domain for Tenant is {org}.onmicrosoft.com but can be changed.

A company can create additional Directories also adding custom domains owned by the company so users can use company emails etc.

#### Users:
Can be associated to multiple directories (instances of EntraID).
3 Types (sources) of users
- ***Cloud Identities***, Source: (external) Microsoft Entra ID. External if defined in another Directory
- ***Directory-synchronized Identities***, Source: Windows AD Server. Users that exist in an on-prem Active Directory. Sync tools like Microsoft Entra Connect lets these users in to Azure. [Migration](#Migration)
- ***Guest Users***, Source: Invited User. Users from other Cloud providers or Microsoft accounts (e.g. XBOX Live) - invited via Microsoft Entra B2B (Accounts are managed in the same Tenant/Directory). B2C to allow external users to self-register. These users are stored in a separate B2C directory.
###### Adding Users options
1. Syncinc on-prem AD to Entra ID
2. Via Azure Portal or Entra ID Admin center
3. Programmatically via cmdline or Microsofts Graph API 
   ([Connect-MgGraph command][https://learn.microsoft.com/en-us/powershell/microsoftgraph/authentication-commands?view=graph-powershell-1.0#using-connect-mggraph] to establish authenticated connection to the directory)
4. [Automatic User Provisioning][https://learn.microsoft.com/en-us/entra/identity/app-provisioning/user-provisioning] includes deprovisioning for employees leaving the company. Can be used with supported apps or for other applications that support SCIM 2.0, follow the steps in [Build a SCIM endpoint and configure user provisioning](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/use-scim-to-provision-users-and-groups).
#### Groups
Allows easier, en masse permission distribution to users.
Group members have the groups permissions and group membership can be restricted by department or jobtitle etc.(dynamic user)
Two types of Entra ID groups:
1. **Security Groups** allow setting permissions for all members. Requires Entra ID admin.
2. **Microsoft365 Groups** allow collaboration on resources like calendar, mailbox, files, docs etc. to members (even people outside your organization).

#### Roles
Built-in Entra ID Roles:
1. Global admin: allowed everything
2. Application admin
3. Application developer
4. Billing admin
5. ...

Built-in Azure Resources Roles
1. Owner: Full access, allowed to grant access to others
2. Contributor: creates and manages resources, but no access granting.
3. Reader: only views resources
4. User Access Administrator: manages user access to Azure resources.
More fine-grained pre-defined roles exist like virtual machine contributor.

**Role Definitions** (defined in JSON)
- Name
- ID
- Description
- Actions (List) allowed Permissions, not included here means denied
- NotActions (List) denied Permissions, used in case Actions uses a Wildcard \* Permission
- DataActions (List) Specific allowed permissions as applied to data, for example `Microsoft.Storage/storageAccounts/blobServices/containers/blobs/read`
- NoDataActions (List) denied permissions applied to data
- Scope restricts to a specific azure subscription or resource ( "/" represents all scopes ). The inheritance order for scope is Management group, Subscription, Resource group, Resource.
- IsCustom true if not built-in role

Permission definition example:
`{Company}.{ProviderName}/{resourceType}/{action}`
[list of azure permissions][https://learn.microsoft.com/en-us/azure/role-based-access-control/resource-provider-operations]

Get a definition of a role with:
```
Get-AzRoleDefinition Owner
```
[More about RBAC][https://learn.microsoft.com/en-us/training/modules/secure-azure-resources-with-rbac/]



## Questions
Is there a distinction for an identity (entra id user) between a user ie. person and a device

#### Migration
The process of embedding users into Entra ID from another source like on-prem AD server.
Sync Tools:
###### **Microsoft Entra Connect**
Allows to configure federation of on-premise ADFS (Active Directory Federation Services) for Entra ID.
requires a local Windows Server with Database and several staging server configurations for a Failover. 
- Syncs on-prem and cloud objects (users groups roles)
- Password Hash syncronization same sign in method for users on AD and EntraID 
- Pass-through-Authentication (PTA) is an alternative to PHS to have the same authentication wether its for on-prem or azure services. Allows to enforce security policies.
- Active Directory Federation-Services incorporation (AD-FS) allow to securely bridge directories of two domains (across enterprises). For example this lets users access a web services of a company that they are not part of but have an agreement with. 
- Allows Hybrid Azure AD join, lets devices remain in local AD servers while also being registered to Entra ID for Azure services and authentication via SSO. Its only an interim step to the full Azure join intended for downwards compatability. [learn.microsoft][https://learn.microsoft.com/en-us/entra/identity/devices/how-to-hybrid-join]
###### **Entra Cloud Sync**
computation happens in Microsofts cloud, uses only a slim Agent on-prem. Two or more on-prem networks do not have to be connected to each other to be synced.

**Entra ID Domain service** 
allows to add virtual machines to a domain that can be accessed  by the using the entra id login.
Can be used to migrate on-premise apps to the cloud. Eliminates the need for a domain controller (server running AD DS, ie. local Entra). (In addition use Sync to embedd on-prem identities into the cloud). 
Still allows Cloud apps to use Kerberos authentication (even if no on-prem Kerberos server exists).

#### Conditional Access [learn.microsoft][https://learn.microsoft.com/en-us/entra/identity/conditional-access/overview]
As a secondary authentication behind the standard first-auth, conditional access can extend resource permission further by policies defined on signals.
A simple policy is an if-else condition, If user wants to access resource then it needs to use MFA.
###### Signals
- **User, Group, Agent**: Policies for specific Users/Groups/Agents (via Agent Identities)
- **Device**: Policies on platforms or state of a device (e.g. priviliged access workstations)
- **IP Geolocation**
- **Application**: policies to traditional cloud apps, on-premises applications, and agent resources
- **Real-time and calculated risk detection**: policies using signals from [**Microsoft Entra ID Protection**](https://learn.microsoft.com/en-us/entra/id-protection/overview-identity-protection) from sign-in behaviour and other activities. (Focus on Identity)
- ****[Microsoft Defender for Cloud Apps](https://learn.microsoft.com/en-us/defender-cloud-apps/what-is-defender-for-cloud-apps)****: uses real time signals from cloud application access and sessions. (Focus on resource/service and sessions)

[Common Policy Templates](https://learn.microsoft.com/en-us/entra/identity/conditional-access/concept-conditional-access-policy-common): 
- Require MFA for admin roles
- Require MFA for Azure management tasks
- Block users using legacy auth-protocols
- Require trusted IP location for classified resource access
- Blocking access from IP ranges in countries without active employees (make exemptions for registered remote work)
- Require company devices for access to specific applications
- Blocking/Reporting suspicious sign in ( multiple failed attempts, from multiple IPs in short time...)

[Conditional Access Best Practice][https://learn.microsoft.com/en-us/entra/identity/conditional-access/plan-conditional-access] (cannot be used in free tier)

[Conditional Access Optimization Agent](https://learn.microsoft.com/en-us/entra/security-copilot/conditional-access-agent-optimization)
Microsoft Agent to analyze security policies

Monitor and filter reports of Policies in Entra's Log Analytics or via Azure Monitor


#### Password Protection
- Password complexity rules
- Password Lifecycle rules: force periodic renewal of passwords
- Self-service password reset (SSPR)
- Risk-based Policies via Entra ID Protection
- Entra ID ban list of common/compromised passwords
- Entra ID Smart Lock-out e.g. when brute-force password cracking is detected
- SSO/Entra ID App Proxies
- Microsoft Entra Connect: keeping on-prem and cloud objects synced

#### Multi-Factor Authentication (MFA) in Entra ID
In case password is compromised.
MFA is enrolled using ***Conditional Access*** Policies. Possible authentication methods (choose at least 2 for backup):
1. Mobile App Verification code (Authenticator TOTP)
2. Mobile App push notification confirmation
3. Call to a phone number. Confirm by using numpad
4. FIDO2 security key -> create own wiki
5. [Windows Hello for Business](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/): device-bound credential with biometric or pin ([[Windows Hello]])
6. OATH tokens in software and hardware form
7. SMS verification
[Deploy MFA](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-mfa-getstarted#enforcing-registration)


## Stages of Deployment in Entra ID
Roll out changes in stages to make it easier to remediate mistakes and allow adjusting to changes.
[in detail](https://learn.microsoft.com/en-us/training/modules/intro-to-azure-ad/5-get-started)

**Stage 1: Secure Foundation**
Before adding users make sure secure default policies are in place.
Create fallbacks/rollback options like a second global admin account in case expirementing with privileges/roles locks the administrator out of entra ID. 
Enforce MFA for apps using conditional access.

**Stage 2: Add and Manage**
Add new users/groups, manage policies for different resources, sync users with existing AD. Add passwordless authentication.

**Stage 3: Manage apps**
Add cloud apps or integrate your own.

**Stage 4: Monitor usage**
Check admin access reviews, user lifecycle via automated provision or dynamic group assignments based on profile information to reduce effort spent.

## Glossary

**Zero Trust**: always require authentication (e.g. even when device is in company network etc.) [Increase Visibility for Zero Trust][https://learn.microsoft.com/en-us/security/zero-trust/deploy/visibility-automation-orchestration] with Microsoft Defender XDR and Microsoft Sentinel (SIEM with AI)
**AD DS** 
# Versioned endpoint inventory

Inventory source: active Fastify plugins in `src/apis/v1/registerRoutes.ts`, `src/apis/v1/auth.api.ts`, and their route modules. Base path is `/api/v1`. Handler names below identify the controller method called by each route. Request schema is the TypeBox DTO/validator symbol passed at the transport boundary; errors use the shared Fastify error handler plus route-specific domain errors. Authentication and authorization are enforced server-side.

| Method and path | Handler | Access | Request schema | Response | Client coverage | Automated coverage |
|---|---|---|---|---|---|---|
| GET `/health` | `HealthController.check` | Public | None | Health DTO | Infrastructure only | `tests/unit/app.test.ts` |
| POST `/auth/register` | `AuthController.register` | Public, OTP rate-limited | `registerUserBody` | `acceptedResponse` (202) | Web + Flutter | `tests/integration/auths/registerUser.test.ts` |
| POST `/auth/email-otp/resend` | `AuthController.requestEmailOtp` | Public, OTP rate-limited | `emailBody` | `acceptedResponse` (202) | Web + Flutter | No direct route test located |
| POST `/auth/email-otp/verify` | `AuthController.verifyEmailOtp` | Public, OTP rate-limited | `verifyEmailOtpBody` | `{ verified: true }` | Web + Flutter | `tests/integration/auths/registerUser.test.ts` tests one-time use |
| POST `/auth/login` | `AuthController.login` | Public, login rate-limited | `loginBody` | `loginResponse` | Web + Flutter | `tests/integration/auths/loginUser.test.ts`; identity suite verifies procurer login |
| POST `/auth/login/complete` | `AuthController.completeLogin` | Challenge token, rate-limited | `completeLoginBody` | `authSessionResponse` | Web + Flutter | `tests/integration/auths/loginUser.test.ts`; identity suite tests enrollment path |
| POST `/auth/password/forgot` | `AuthController.requestPasswordReset` | Public, OTP rate-limited | `emailBody` | `acceptedResponse` (202) | Web + Flutter | `tests/integration/auths/registerUser.test.ts` checks generic response |
| POST `/auth/password/reset` | `AuthController.resetPassword` | Public, token-based | `resetPasswordBody` | Password reset result | Web + Flutter | `tests/integration/auths/registerUser.test.ts` tests token replay |
| POST `/auth/password/change` | `AuthController.changePassword` | Authenticated user | `changePasswordBody` | Password changed + sign-in required | Web + Flutter | `tests/integration/auths/loginUser.test.ts` |
| GET `/me` | `AuthController.currentUser` | Authenticated user | None | Current-user DTO | Web + Flutter | `tests/integration/auths/registerUser.test.ts` |
| POST `/auth/mfa/totp/enroll` | `MfaController.enroll` | Optional auth; enrollment challenge validated by service | `enrollTotpBody` | Secret, URI, challenge expiry | Web + Flutter | `tests/integration/auths/loginUser.test.ts`, `tests/integration/identity/procurerApplication.test.ts` |
| POST `/auth/mfa/totp/verify` | `MfaController.verifyEnrollment` | Optional auth; challenge validated by service | `verifyTotpEnrollmentBody` | Session/enrollment result | Web + Flutter | `tests/integration/auths/loginUser.test.ts`, `tests/integration/identity/procurerApplication.test.ts` |
| GET `/auth/mfa/status` | `MfaController.status` | Authenticated user | None | `{ enabled }` | Web + Flutter Security settings | No direct route test located |
| POST `/auth/mfa/totp/disable` | `MfaController.disable` | Authenticated user + password/code DTO | `disableMfaBody` | Disabled + sign-in required | Web + Flutter Security settings | No direct route test located |
| POST `/auth/refresh` | `SessionController.refresh` | Refresh token | `refreshSessionBody` | Rotated `authSessionResponse` | Web + Flutter | `tests/integration/auths/registerUser.test.ts`, `tests/unit/auths/sessionRotation.test.ts` |
| POST `/auth/logout` | `SessionController.logout` | Authenticated session | None | `{ ok: true }` | Web + Flutter | `tests/integration/auths/registerUser.test.ts` |
| POST `/auth/logout-all` | `SessionController.logoutAll` | Authenticated user | None | Revoked count | Web settings; Flutter Security settings | No direct route test located |
| GET `/auth/sessions` | `SessionController.list` | Authenticated user | None | Session DTO array | Web settings; Flutter Security settings | No direct route test located |
| DELETE `/auth/sessions/:sessionId` | `SessionController.revoke` | Authenticated owner, UUID path | UUID `sessionId` | `{ ok: true }` | Web settings; Flutter Security settings | No direct route test located |
| POST `/procurer-applications` | `ProcurerApplicationController.submit` | Public or authenticated applicant, rate-limited | `submitProcurerApplicationBody` | Reference + challenge (202) | Web + Flutter | `tests/integration/identity/procurerApplication.test.ts` |
| POST `/procurer-applications/email/verify` | `ProcurerApplicationController.verifyEmail` | Public, rate-limited | `verifyApplicationEmailBody` | `{ verified: true }` | Web + Flutter | Identity integration |
| POST `/procurer-applications/status/request` | `ProcurerApplicationController.requestStatusLookup` | Public, rate-limited | `applicationStatusRequestBody` | Accepted + challenge (202) | Web + Flutter | Identity integration |
| POST `/procurer-applications/status/verify` | `ProcurerApplicationController.verifyStatusLookup` | Public, rate-limited | `verifyApplicationEmailBody` | Status lookup DTO | Web + Flutter | Identity integration |
| GET `/procurer-applications/me` | `ProcurerApplicationController.ownApplication` | Authenticated owner | None | Application DTO or null | Web + Flutter | No direct route test located |
| POST `/invitations/preview` | `ProcurerApplicationController.previewInvitation` | Public, rate-limited, token-bound | `invitationPreviewBody` | Safe invitation preview | Web + Flutter | Invitation expiry/replay tests |
| POST `/invitations/accept` | `ProcurerApplicationController.acceptInvitation` | Public or authenticated; one-time token | `acceptProcurerInvitationBody` | Accepted role/status | Web + Flutter | Invitation race/replay tests |
| GET `/admin/procurer-applications` | `ProcurerApplicationController.list` | Staff `procurerApplication.read` | Optional status query | Application DTO array | Web + Flutter staff views | No direct route test located |
| GET `/admin/procurer-applications/:id` | `ProcurerApplicationController.get` | Staff `procurerApplication.read` | Application ID params | Application DTO | Web + Flutter staff views | No direct route test located |
| POST `/admin/procurer-applications/:id/identity-checks` | `ProcurerApplicationController.recordChecks` | Staff `procurerApplication.review` | `identityCheckBody` + ID | `{ checksRecorded }` | Web + Flutter review | Identity permission tests |
| POST `/admin/procurer-applications/:id/request-information` | `ProcurerApplicationController.review` | Staff `procurerApplication.review` | `applicationReviewBody` + ID | Updated status | Web + Flutter review | Identity review tests |
| POST `/admin/procurer-applications/:id/approve` | `ProcurerApplicationController.review` | Staff `procurerApplication.review` | `applicationReviewBody` + ID | Updated status | Web + Flutter review | Identity review tests |
| POST `/admin/procurer-applications/:id/reject` | `ProcurerApplicationController.review` | Staff `procurerApplication.review` | `applicationReviewBody` + ID | Updated status | Web + Flutter review | Identity review tests |
| POST `/super-admin/staff/invite-admin` | `StaffController.inviteAdministrator` | SUPER_ADMIN + recent MFA | `staffInvitationBody` | Invitation expiry (202) | Web + Flutter subset | `tests/integration/identity/procurerApplication.test.ts` |
| POST `/super-admin/staff/invite-super-admin` | `StaffController.inviteSuperAdministrator` | SUPER_ADMIN + recent MFA | Email/name/reason schema | Invitation expiry (202) | Web + Flutter subset | No direct route test located |
| GET `/super-admin/staff` | `StaffController.listStaff` | SUPER_ADMIN + recent MFA | None | Staff DTO array | Web + Flutter | No direct route test located |
| GET `/super-admin/permissions` | `StaffController.permissionCatalog` | SUPER_ADMIN + recent MFA | None | Codes and profiles | Web + Flutter read only | No direct route test located |
| GET `/super-admin/audit-logs` | `StaffController.listAuditLogs` | SUPER_ADMIN + recent MFA | None | Audit DTO array | Web; absent in Flutter | No direct route test located |
| PATCH `/super-admin/staff/:id/permissions` | `StaffController.updatePermissions` | SUPER_ADMIN + recent MFA | `staffPermissionsBody` + ID | `{ updated }` | Web absent; Flutter absent | No direct route test located |
| POST `/super-admin/staff/:id/suspend` | `StaffController.suspend` | SUPER_ADMIN + recent MFA | `staffDecisionBody` + ID | `{ suspended }` | Web + Flutter | `tests/integration/identity/procurerApplication.test.ts` covers last-admin protection, not all route paths |
| POST `/super-admin/staff/:id/revoke` | `StaffController.revoke` | SUPER_ADMIN + recent MFA | `staffDecisionBody` + ID | `{ revoked }` | Web + Flutter | `tests/integration/identity/procurerApplication.test.ts` covers last-admin protection |

## Contract and UI limitations

- Concrete error variants depend on the shared Fastify error serializer and thrown domain errors. TypeBox schemas define successful responses; they do not enumerate every failure response per operation. Tests should assert shared validation/authentication errors and route-specific domain error codes.
- Validation definitions live in `src/dtos/auths/auth.dto.ts`, `src/dtos/identity/procurerApplication.dto.ts`, and `src/dtos/administrators/staff.dto.ts`. Examples include email max 320 characters, password 12–128 characters, OTP exactly six numeric digits, UUID path IDs, and `additionalProperties: false`; consult each DTO for full per-operation constraints.
- Web and Flutter currently wire core authentication and procurer application flows. Web Security settings now uses the real session and MFA endpoints. Mobile session management, mobile MFA status/disable, mobile staff permission editing and audit-log screens remain unimplemented.
- Route files for shopping lists, addresses, users, delivery zones, orders, quotations, payments, conversations, notifications, refunds, pricing, uploads and settings are zero-byte or unregistered. The related domain operations are not available over HTTP and must not be represented as functional UI.
- No active socket/websocket route exists. Live messaging, delivery tracking, operational notifications, payment checkout and withdrawal actions have no available client contract today.
- Test paths above are from repository test source. They do not establish a green integration run. The database integration suites are conditional on `AUTH_TEST_DATABASE_URL`; a run without it skips those suites. Several unrelated tests are marked `todo` or `skip` and remain incomplete.

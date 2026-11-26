import type { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { Type } from 'typebox';
import type { AuthenticationApiOptions } from '../../apis/v1/auth.api.js';
import { STAFF_API_PATHS } from '../../constants/api.constants.js';
import { StaffController } from '../../controllers/administrators/staff.controller.js';
import { staffDecisionBody, staffIdParams, staffInvitationBody, staffPermissionsBody } from '../../dtos/administrators/staff.dto.js';
import { createAuthenticateMiddleware, getAuthenticatedPrincipal, requireAuthenticatedRole, requireRecentMfa } from '../../middlewares/authenticate.middleware.js';
import { UserRole } from '../../enums/userRole.enum.js';

export const staffRoute: FastifyPluginAsync<AuthenticationApiOptions> = async (app, options) => {
  const api = app.withTypeProvider<TypeBoxTypeProvider>();
  const controller = new StaffController(options.authDependencies);
  const authenticate = createAuthenticateMiddleware(options.authDependencies);
  const superAdministrator = requireAuthenticatedRole(UserRole.SUPER_ADMIN);
  const authorizedSuperAdministrator = [authenticate, superAdministrator];

  api.post(STAFF_API_PATHS.inviteAdministrator, { preHandler: authorizedSuperAdministrator, schema: { body: staffInvitationBody, response: { 202: Type.Object({ invited: Type.Literal(true), expiresAt: Type.String() }) }, tags: ['staff administration'], security: [{ bearerAuth: [] }], operationId: 'inviteAdministrator' } }, async (request, reply) => {
    requireRecentMfa(request);
    return reply.code(202).send(await controller.inviteAdministrator({ ...request.body, issuerId: getAuthenticatedPrincipal(request).userId }));
  });
  api.post(STAFF_API_PATHS.inviteSuperAdministrator, { preHandler: authorizedSuperAdministrator, schema: { body: Type.Object({ email: staffInvitationBody.properties.email, displayName: staffInvitationBody.properties.displayName, reason: staffInvitationBody.properties.reason }, { additionalProperties: false }), response: { 202: Type.Object({ invited: Type.Literal(true), expiresAt: Type.String() }) }, tags: ['staff administration'], security: [{ bearerAuth: [] }], operationId: 'inviteSuperAdministrator' } }, async (request, reply) => {
    requireRecentMfa(request);
    return reply.code(202).send(await controller.inviteSuperAdministrator({ ...request.body, issuerId: getAuthenticatedPrincipal(request).userId }));
  });
  api.get(STAFF_API_PATHS.staff, { preHandler: authorizedSuperAdministrator, schema: { response: { 200: Type.Array(Type.Object({ id: Type.String(), email: Type.String(), displayName: Type.Union([Type.String(), Type.Null()]), roles: Type.Array(Type.String()), status: Type.String(), permissions: Type.Array(Type.String()) })) }, tags: ['staff administration'], security: [{ bearerAuth: [] }], operationId: 'listStaff' } }, async (request) => {
    requireRecentMfa(request);
    return controller.listStaff();
  });
  api.get(STAFF_API_PATHS.permissions, { preHandler: authorizedSuperAdministrator, schema: { response: { 200: Type.Object({ codes: Type.Array(Type.String()), profiles: Type.Record(Type.String(), Type.Array(Type.String())) }) }, tags: ['staff administration'], security: [{ bearerAuth: [] }], operationId: 'getStaffPermissionProfiles' } }, async (request) => {
    requireRecentMfa(request);
    return controller.permissionCatalog();
  });
  api.get(STAFF_API_PATHS.auditLogs, { preHandler: authorizedSuperAdministrator, schema: { response: { 200: Type.Array(Type.Object({ action: Type.String(), resourceType: Type.String(), resourceId: Type.Union([Type.String(), Type.Null()]), actorId: Type.Union([Type.String(), Type.Null()]), createdAt: Type.String() })) }, tags: ['staff administration'], security: [{ bearerAuth: [] }], operationId: 'listStaffAuditLogs' } }, async (request) => {
    requireRecentMfa(request);
    return controller.listAuditLogs();
  });
  api.patch(STAFF_API_PATHS.updatePermissions, { preHandler: authorizedSuperAdministrator, schema: { params: staffIdParams, body: staffPermissionsBody, response: { 200: Type.Object({ updated: Type.Literal(true) }) }, tags: ['staff administration'], security: [{ bearerAuth: [] }], operationId: 'updateStaffPermissions' } }, async (request) => {
    requireRecentMfa(request);
    return controller.updatePermissions({ ...request.body, userId: request.params.id, actorId: getAuthenticatedPrincipal(request).userId });
  });
  api.post(STAFF_API_PATHS.suspendStaff, { preHandler: authorizedSuperAdministrator, schema: { params: staffIdParams, body: staffDecisionBody, response: { 200: Type.Object({ suspended: Type.Literal(true) }) }, tags: ['staff administration'], security: [{ bearerAuth: [] }], operationId: 'suspendStaff' } }, async (request) => {
    requireRecentMfa(request);
    return controller.suspend({ ...request.body, userId: request.params.id, actorId: getAuthenticatedPrincipal(request).userId });
  });
  api.post(STAFF_API_PATHS.reactivateStaff, { preHandler: authorizedSuperAdministrator, schema: { params: staffIdParams, body: staffDecisionBody, response: { 200: Type.Object({ reactivated: Type.Literal(true), signInAgain: Type.Literal(true) }) }, tags: ['staff administration'], security: [{ bearerAuth: [] }], operationId: 'reactivateStaff' } }, async (request) => {
    requireRecentMfa(request);
    return controller.reactivate({ ...request.body, userId: request.params.id, actorId: getAuthenticatedPrincipal(request).userId });
  });
  api.post(STAFF_API_PATHS.revokeStaff, { preHandler: authorizedSuperAdministrator, schema: { params: staffIdParams, body: staffDecisionBody, response: { 200: Type.Object({ revoked: Type.Literal(true) }) }, tags: ['staff administration'], security: [{ bearerAuth: [] }], operationId: 'revokeStaff' } }, async (request) => {
    requireRecentMfa(request);
    return controller.revoke({ ...request.body, userId: request.params.id, actorId: getAuthenticatedPrincipal(request).userId });
  });
};

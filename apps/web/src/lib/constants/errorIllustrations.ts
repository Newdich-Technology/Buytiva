const illustrationGroups: Record<string, string[]> = {
  paper: ['paper_scraps', 'lost_list', 'two_list_sheets', 'blank_floating_list', 'pencil_list'],
  access: ['sleepy_key', 'closed_ribbon_door', 'ribbon_lock'],
  route: ['puzzled_arrow', 'quiet_map', 'split_signpost', 'stalled_delivery_route'],
  clock: ['tired_clock', 'patient_clock', 'waiting_mail'],
  document: ['oversized_folder', 'mixed_file_shapes', 'magnifying_file', 'file_with_stop', 'returned_form'],
  message: ['offline_speech_bubble', 'empty_meeting_spot', 'resting_buddy'],
  payment: ['floating_receipt', 'slipped_receipt', 'separate_jars'],
  parcel: ['parcel_bridge'],
  ribbon: ['unraveled_ribbon', 'tangled_ribbon']
};

const uniqueErrorScenes: Record<string, string> = {
	paper_scraps: 'bad_request_scene', sleepy_key: 'unauthenticated_scene',
	closed_ribbon_door: 'forbidden_scene', lost_list: 'lost_list_scene',
	tired_clock: 'request_timeout_scene', two_list_sheets: 'stale_quote_scene',
	unraveled_ribbon: 'invitation_expired_scene', pencil_list: 'validation_failed_scene',
	patient_clock: 'rate_limited_scene', tangled_ribbon: 'server_error_scene',
	parcel_bridge: 'bad_gateway_scene', resting_buddy: 'service_unavailable_scene',
	offline_speech_bubble: 'offline_scene', quiet_map: 'no_coverage_scene',
	empty_meeting_spot: 'no_procurers_scene', slipped_receipt: 'payment_failed_scene'
};

export function resolveErrorIllustration(illustration: string): string {
	if (uniqueErrorScenes[illustration]) return uniqueErrorScenes[illustration];
  return Object.entries(illustrationGroups).find(([, keys]) => keys.includes(illustration))?.[0] ?? 'paper';
}

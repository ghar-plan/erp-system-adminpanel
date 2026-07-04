export enum sitePermissions {
  // Dashboard
  VIEW_DASHBOARD = "view_dashboard",
  
  // User Management
  VIEW_ATTENDEES = "view_attendees",
  CREATE_ATTENDEE = "create_attendee",
  EDIT_ATTENDEE = "edit_attendee",
  DELETE_ATTENDEE = "delete_attendee",
  
  VIEW_HOSTS = "view_hosts",
  CREATE_HOST = "create_host",
  EDIT_HOST = "edit_host",
  DELETE_HOST = "delete_host",
  
  VIEW_AMBASSADORS = "view_ambassadors",
  CREATE_AMBASSADOR = "create_ambassador",
  EDIT_AMBASSADOR = "edit_ambassador",
  DELETE_AMBASSADOR = "delete_ambassador",
  
  VIEW_MINORS = "view_minors",
  CREATE_MINOR = "create_minor",
  EDIT_MINOR = "edit_minor",
  DELETE_MINOR = "delete_minor",
  
  VIEW_RSVPS = "view_rsvps",
  
  // Host Management
  VIEW_HOST_SUBSCRIPTIONS = "view_host_subscriptions",
  MANAGE_HOST_SUBSCRIPTIONS = "manage_host_subscriptions",
  VIEW_CANCEL_EVENTS = "view_cancel_events",
  
  // Communities
  VIEW_COMMUNITIES = "view_communities",
  CREATE_COMMUNITY = "create_community",
  EDIT_COMMUNITY = "edit_community",
  DELETE_COMMUNITY = "delete_community",
  
  // Business Management
  VIEW_BUSINESS_MANAGEMENT = "view_business_management",
  
  // Experiences
  VIEW_EXPERIENCES = "view_experiences",
  CREATE_EXPERIENCE = "create_experience",
  EDIT_EXPERIENCE = "edit_experience",
  DELETE_EXPERIENCE = "delete_experience",
  
  // Badges
  VIEW_EVENT_BADGES = "view_event_badges",
  CREATE_EVENT_BADGE = "create_event_badge",
  EDIT_EVENT_BADGE = "edit_event_badge",
  DELETE_EVENT_BADGE = "delete_event_badge",
  
  VIEW_ACHIEVEMENT_BADGES = "view_achievement_badges",
  CREATE_ACHIEVEMENT_BADGE = "create_achievement_badge",
  EDIT_ACHIEVEMENT_BADGE = "edit_achievement_badge",
  DELETE_ACHIEVEMENT_BADGE = "delete_achievement_badge",
  
  VIEW_CORE_CONCEPT_BADGES = "view_core_concept_badges",
  CREATE_CORE_CONCEPT_BADGE = "create_core_concept_badge",
  EDIT_CORE_CONCEPT_BADGE = "edit_core_concept_badge",
  DELETE_CORE_CONCEPT_BADGE = "delete_core_concept_badge",
  
  // Resource Library
  VIEW_RESOURCE_LIBRARY = "view_resource_library",
  CREATE_RESOURCE = "create_resource",
  EDIT_RESOURCE = "edit_resource",
  DELETE_RESOURCE = "delete_resource",
  
  // Policy & Agreement
  VIEW_POLICY_AGREEMENT = "view_policy_agreement",
  EDIT_POLICY = "edit_policy",
  
  // Cup of Gratitude
  VIEW_CUP_OF_GRATITUDE = "view_cup_of_gratitude",
  CREATE_CUP_OF_GRATITUDE = "create_cup_of_gratitude",
  EDIT_CUP_OF_GRATITUDE = "edit_cup_of_gratitude",
  DELETE_CUP_OF_GRATITUDE = "delete_cup_of_gratitude",
  
  // Team Management
  VIEW_TEAM_MEMBERS = "view_team_members",
  CREATE_TEAM_MEMBER = "create_team_member",
  EDIT_TEAM_MEMBER = "edit_team_member",
  DELETE_TEAM_MEMBER = "delete_team_member",
  
  VIEW_ROLE_MANAGEMENT = "view_role_management",
  CREATE_ROLE = "create_role",
  EDIT_ROLE = "edit_role",
  DELETE_ROLE = "delete_role",
  
  // Master Portal
  VIEW_PRODUCT_ITEMS = "view_product_items",
  CREATE_PRODUCT_ITEM = "create_product_item",
  EDIT_PRODUCT_ITEM = "edit_product_item",
  DELETE_PRODUCT_ITEM = "delete_product_item",
  
  VIEW_ORDER_REQUESTS = "view_order_requests",
  MANAGE_ORDER_REQUESTS = "manage_order_requests",
}


export interface UserEvent {
  id: string;
  event_id: string;
  event_date: string;
  title: string;
  color: string;
  location_point?: { lat: number; lng: number };
  is_public: boolean;
  street: string;
  event_type: 'show' | 'rehearsalspace';
}

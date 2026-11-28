package flatmatch.flatmate_finder.dto;

import flatmatch.flatmate_finder.entity.Preferences;
import flatmatch.flatmate_finder.entity.Profile;
import flatmatch.flatmate_finder.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public  class Seeker {
    private final User user;
    private final Profile profile;
    private final Preferences prefs;
}
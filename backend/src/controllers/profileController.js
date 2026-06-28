const { User, StudentProfile } = require('../models');

// Get current user's profile (with student profile if exists)
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.UserId, {
            attributes: { exclude: ['PasswordHash'] },
            include: [{
                model: StudentProfile,
                attributes: ['ProfileId', 'Institution', 'Major', 'YearOfStudy', 'StudyStreak', 'TotalStudyMinutes', 'PreferredDifficulty']
            }]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update or create student profile
exports.updateMyProfile = async (req, res) => {
    try {
        const { Institution, Major, YearOfStudy, PreferredDifficulty } = req.body;
        const userId = req.user.UserId;

        // Find or create profile
        let profile = await StudentProfile.findOne({ where: { UserId: userId } });

        if (profile) {
            // Update existing
            profile.Institution = Institution || profile.Institution;
            profile.Major = Major || profile.Major;
            profile.YearOfStudy = YearOfStudy || profile.YearOfStudy;
            profile.PreferredDifficulty = PreferredDifficulty || profile.PreferredDifficulty;
            await profile.save();
        } else {
            // Create new
            profile = await StudentProfile.create({
                UserId: userId,
                Institution,
                Major,
                YearOfStudy,
                PreferredDifficulty,
            });
        }

        // Fetch updated user with profile
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['PasswordHash'] },
            include: [StudentProfile]
        });

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
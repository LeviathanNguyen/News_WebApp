const validator = {
    // Validate đăng ký
    validateRegister: (req, res, next) => {
        const { username, email, password, fullname } = req.body;
        const errors = [];

        // Validate username
        if (!username || username.length < 3) {
            errors.push('Username phải có ít nhất 3 ký tự');
        } else if (username.length > 50) {
            errors.push('Username không được vượt quá 50 ký tự');
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errors.push('Username chỉ được chứa chữ cái, số và dấu gạch dưới');
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.push('Email không được để trống');
        } else if (!emailRegex.test(email)) {
            errors.push('Email không hợp lệ');
        } else if (email.length > 100) {
            errors.push('Email không được vượt quá 100 ký tự');
        }

        // Validate password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!password) {
            errors.push('Mật khẩu không được để trống');
        } else if (!passwordRegex.test(password)) {
            errors.push('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
        } else if (password.length > 100) {
            errors.push('Mật khẩu không được vượt quá 100 ký tự');
        }

        // Validate fullname
        if (!fullname) {
            errors.push('Họ tên không được để trống');
        } else if (fullname.trim().length < 2) {
            errors.push('Họ tên phải có ít nhất 2 ký tự');
        } else if (fullname.length > 100) {
            errors.push('Họ tên không được vượt quá 100 ký tự');
        } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullname)) {
            errors.push('Họ tên chỉ được chứa chữ cái và khoảng trắng');
        }

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        next();
    },

    // Validate đăng nhập
    validateLogin: (req, res, next) => {
        const { email, password } = req.body;
        const errors = [];

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.push('Email không được để trống');
        } else if (!emailRegex.test(email)) {
            errors.push('Email không hợp lệ');
        }

        // Validate password
        if (!password) {
            errors.push('Mật khẩu không được để trống');
        } else if (password.length < 8) {
            errors.push('Mật khẩu phải có ít nhất 8 ký tự');
        }

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        next();
    },

    // Validate email (dùng cho quên mật khẩu)
    validateEmail: (req, res, next) => {
        const { email } = req.body;
        const errors = [];

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.push('Email không được để trống');
        } else if (!emailRegex.test(email)) {
            errors.push('Email không hợp lệ');
        } else if (email.length > 100) {
            errors.push('Email không được vượt quá 100 ký tự');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        next();
    },

    // Validate reset password
    validatePasswordReset: (req, res, next) => {
        const { email, otp, newPassword } = req.body;
        const errors = [];

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.push('Email không được để trống');
        } else if (!emailRegex.test(email)) {
            errors.push('Email không hợp lệ');
        }

        // Validate OTP
        if (!otp) {
            errors.push('Mã OTP không được để trống');
        } else if (!/^\d{6}$/.test(otp)) {
            errors.push('Mã OTP phải là 6 chữ số');
        }

        // Validate new password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!newPassword) {
            errors.push('Mật khẩu mới không được để trống');
        } else if (!passwordRegex.test(newPassword)) {
            errors.push('Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
        } else if (newPassword.length > 100) {
            errors.push('Mật khẩu không được vượt quá 100 ký tự');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        next();
    },

    // Validate cập nhật thông tin user
    validateUpdateProfile: (req, res, next) => {
        const { fullname, nickname, email, dob } = req.body;
        const errors = [];

        // Validate fullname nếu được cung cấp
        if (fullname !== undefined) {
            if (fullname.trim().length < 2) {
                errors.push('Họ tên phải có ít nhất 2 ký tự');
            } else if (fullname.length > 100) {
                errors.push('Họ tên không được vượt quá 100 ký tự');
            } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(fullname)) {
                errors.push('Họ tên chỉ được chứa chữ cái và khoảng trắng');
            }
        }

        // Validate nickname nếu được cung cấp
        if (nickname !== undefined && nickname !== null) {
            if (nickname.length > 50) {
                errors.push('Bút danh không được vượt quá 50 ký tự');
            }
        }

        // Validate email nếu được cung cấp
        if (email !== undefined) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push('Email không hợp lệ');
            } else if (email.length > 100) {
                errors.push('Email không được vượt quá 100 ký tự');
            }
        }

        // Validate dob nếu được cung cấp
        if (dob !== undefined && dob !== null) {
            const dobDate = new Date(dob);
            if (isNaN(dobDate.getTime())) {
                errors.push('Ngày sinh không hợp lệ');
            } else {
                const now = new Date();
                const minDate = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
                if (dobDate > now) {
                    errors.push('Ngày sinh không thể là ngày trong tương lai');
                } else if (dobDate < minDate) {
                    errors.push('Ngày sinh không hợp lệ');
                }
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                errors
            });
        }

        next();
    }
};

module.exports = validator;
#pragma once

#include "opentimelineio/effect.h"
#include "opentimelineio/version.h"
#include "opentime/rational.h"

using opentime::Rational;

namespace {
constexpr Rational One      = Rational(1, 1);
constexpr Rational MinusOne = Rational(-1, 1);
constexpr Rational Zero     = Rational(0, 1);
};  // anonymous namespace

namespace opentimelineio { namespace OPENTIMELINEIO_VERSION {

/// @brief An scaling effect
class VideoScale : public Effect
{
public:
    /// @brief This struct provides the Effect schema.
    struct Schema
    {
        static auto constexpr name   = "VideoScale";
        static int constexpr version = 1;
    };

    using Parent = Effect;

    /// @brief Create a new scaling effect.
    ///
    /// @param name The name of the effect object.
    /// @param width How much to scale the width by.
    /// @param height How much to scale the height by.
    /// @param metadata The metadata for the effect.
    /// @param enabled Whether the effect is enabled.
    VideoScale(
        std::string const&   name        = std::string(),
        Rational             width       = One,
        Rational             height      = One,
        AnyDictionary const& metadata    = AnyDictionary(),
        bool                 enabled     = true)
        : Effect(name, Schema::name, metadata, enabled)
        , _width(width)
        , _height(height)
    {}

    const Rational& width() const noexcept { return _width; }
    const Rational& height() const noexcept { return _height; }

    void set_width(Rational const& width) noexcept { _width = width; }
    void set_height(Rational const& height) noexcept { _height = height; }

protected:

    virtual ~VideoScale() = default;
    bool read_from(Reader&) override;
    void write_to(Writer&) const override;
    
    Rational _width;  ///< The width scaling factor.
    Rational _height; ///< The height scaling factor.
};

/// @brief An crop effect
class VideoCrop : public Effect
{
public:
    /// @brief This struct provides the Effect schema.
    struct Schema
    {
        static auto constexpr name   = "VideoCrop";
        static int constexpr version = 1;
    };

    using Parent = Effect;

    /// @brief Create a new crop effect.
    ///
    /// @param name The name of the effect object.
    /// @param left The amount to crop from the left.
    /// @param right The amount to crop from the right.
    /// @param top The amount to crop from the top.
    /// @param bottom The amount to crop from the bottom.
    /// @param metadata The metadata for the effect.
    /// @param enabled Whether the effect is enabled.
    VideoCrop(
        std::string const&   name        = std::string(),
        Rational             left        = MinusOne,
        Rational             right       = One,
        Rational             top         = MinusOne,
        Rational             bottom      = One,
        AnyDictionary const& metadata    = AnyDictionary(),
        bool                 enabled     = true)
        : Effect(name, Schema::name, metadata, enabled)
        , _left(left)
        , _right(right)
        , _top(top)
        , _bottom(bottom)
    {}

    const Rational& left() const noexcept { return _left; }
    const Rational& right() const noexcept { return _right; }
    const Rational& top() const noexcept { return _top; }
    const Rational& bottom() const noexcept { return _bottom; }

    void set_left(Rational const& left) noexcept { _left = left; }
    void set_right(Rational const& right) noexcept { _right = right; }
    void set_top(Rational const& top) noexcept { _top = top; }
    void set_bottom(Rational const& bottom) noexcept { _bottom = bottom; }

protected:
    virtual ~VideoCrop() = default;
    bool read_from(Reader&) override;
    void write_to(Writer&) const override;

    Rational _left;   ///< The amount to crop from the left.
    Rational _right;  ///< The amount to crop from the right.
    Rational _top;    ///< The amount to crop from the top.
    Rational _bottom; ///< The amount to crop from the bottom.
};

/// @brief An position effect
class VideoPosition : public Effect
{
public:
    /// @brief This struct provides the Effect schema.
    struct Schema
    {
        static auto constexpr name   = "VideoPosition";
        static int constexpr version = 1;
    };

    using Parent = Effect;

    /// @brief Create a new position effect.
    ///
    /// @param name The name of the effect object.
    /// @param x The horizontal shift of the image centre.
    /// @param y The vertical shift of the image centre.
    /// @param metadata The metadata for the effect.
    /// @param enabled Whether the effect is enabled.
    VideoPosition(
        std::string const&   name        = std::string(),
        Rational             x           = Zero,
        Rational             y           = Zero,
        AnyDictionary const& metadata    = AnyDictionary(),
        bool                 enabled     = true)
        : Effect(name, Schema::name, metadata, enabled)
        , _x(x)
        , _y(y)
    {}

    const Rational& x() const noexcept { return _x; }
    const Rational& y() const noexcept { return _y; }

    void set_x(Rational const& x) noexcept { _x = x; }
    void set_y(Rational const& y) noexcept { _y = y; }

protected:
    virtual ~VideoPosition() = default;
    bool read_from(Reader&) override;
    void write_to(Writer&) const override;

    Rational _x; ///< The horizontal position.
    Rational _y; ///< The vertical position.
};

/// @brief An rotation effect
class VideoRotate : public Effect
{
public:
    /// @brief This struct provides the Effect schema.
    struct Schema
    {
        static auto constexpr name   = "VideoRotate";
        static int constexpr version = 1;
    };

    using Parent = Effect;

    /// @brief Create a new rotation effect.
    ///
    /// @param name The name of the effect object.
    /// @param angle The amount of rotation in (0 = none, 1 = full clockwise).
    /// @param metadata The metadata for the effect.
    /// @param enabled Whether the effect is enabled.
    VideoRotate(
        std::string const&   name        = std::string(),
        Rational             angle       = Zero,
        AnyDictionary const& metadata    = AnyDictionary(),
        bool                 enabled     = true)
        : Effect(name, Schema::name, metadata, enabled)
        , _angle(angle)
    {}

    const Rational& angle() const noexcept { return _angle; }
    void set_angle(Rational const& angle) noexcept { _angle = angle; }

protected:
    virtual ~VideoRotate() = default;
    bool read_from(Reader&) override;
    void write_to(Writer&) const override;

    Rational _angle; ///< The rotation angle (0 = none, 1 = full clockwise).
};

}} // namespace opentimelineio::OPENTIMELINEIO_VERSION

"""Formatting utilities for ClimateTwin AI."""

from datetime import datetime


def format_temperature(value: float, show_sign: bool = True) -> str:
    """Format temperature value."""
    sign = "+" if value >= 0 and show_sign else ""
    return f"{sign}{value:.1f}°C"


def format_co2(value: float) -> str:
    """Format CO2 emissions value."""
    if abs(value) >= 1000:
        return f"{value/1000:.1f} Gt"
    return f"{value:.1f} Mt"


def format_percentage(value: float) -> str:
    """Format percentage value."""
    return f"{value:.1f}%"


def format_date(date: datetime, format_str: str = "%Y-%m-%d") -> str:
    """Format datetime to string."""
    return date.strftime(format_str)


def format_action_name(action_id: str) -> str:
    """Convert action ID to human-readable name."""
    return action_id.replace("_", " ").title()


def format_region_name(region: str) -> str:
    """Format region name for display."""
    region_map = {
        "global": "Global",
        "north_america": "North America",
        "europe": "Europe",
        "asia_pacific": "Asia Pacific",
        "africa": "Africa",
        "south_america": "South America",
        "middle_east": "Middle East",
    }
    return region_map.get(region.lower(), region)

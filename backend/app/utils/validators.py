"""Validation utilities for ClimateTwin AI."""

import re
from typing import Tuple


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_scenario_name(name: str) -> Tuple[bool, str]:
    """Validate scenario name."""
    if not name or len(name.strip()) < 3:
        return False, "Scenario name must be at least 3 characters"
    if len(name) > 100:
        return False, "Scenario name must be less than 100 characters"
    return True, ""


def validate_year_range(start_year: int, end_year: int) -> Tuple[bool, str]:
    """Validate year range for simulation."""
    if start_year < 2024:
        return False, "Start year must be 2024 or later"
    if end_year > 2035:
        return False, "End year must be 2035 or earlier"
    if end_year <= start_year:
        return False, "End year must be after start year"
    return True, ""


def validate_actions(actions: list) -> Tuple[bool, str]:
    """Validate selected actions."""
    valid_actions = [
        "renewable_energy", "public_transit", "reforestation",
        "carbon_tax", "waste_reduction", "green_buildings",
    ]
    
    if not actions:
        return False, "At least one action must be selected"
    
    for action in actions:
        if action not in valid_actions:
            return False, f"Invalid action: {action}"
    
    return True, ""


def validate_region(region: str) -> Tuple[bool, str]:
    """Validate region name."""
    valid_regions = [
        "Global", "North America", "Europe", "Asia Pacific",
        "Africa", "South America", "Middle East",
    ]
    
    if region not in valid_regions:
        return False, f"Invalid region. Must be one of: {', '.join(valid_regions)}"
    
    return True, ""

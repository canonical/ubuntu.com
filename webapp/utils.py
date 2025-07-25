import dateutil.parser
import pytz


def format_community_event_time(event):
    """
    Format event start and end times with timezone conversion.
    ex. 25 Jan, 10:00 AM - 12:00 PM (UTC)
    """
    start_dt = dateutil.parser.parse(event["starts_at"])
    end_dt = dateutil.parser.parse(event["ends_at"])
    timezone_name = event.get("timezone", "")

    try:
        tz = pytz.timezone(timezone_name)
        start_dt = start_dt.astimezone(tz)
        end_dt = end_dt.astimezone(tz)
        tz_abbr = start_dt.strftime("%Z")
    except pytz.UnknownTimeZoneError:
        tz_abbr = timezone_name

    # If same date, only show date once
    if start_dt.date() == end_dt.date():
        date_part = start_dt.strftime("%d %b,").replace(
            start_dt.strftime("%b"), start_dt.strftime("%b").capitalize()
        )
        start_time_part = start_dt.strftime("%I:%M").lstrip("0")
        end_time_part = end_dt.strftime("%I:%M").lstrip("0")
        start_period = start_dt.strftime("%p")
        end_period = end_dt.strftime("%p")

        # If same AM/PM period, only show it once at the end
        if start_period == end_period:
            event["formatted_time"] = (
                f"{date_part} {start_time_part}-"
                f"{end_time_part} {end_period} ({tz_abbr})"
            )
        else:
            event["formatted_time"] = (
                f"{date_part} {start_time_part} {start_period}-"
                f"{end_time_part} {end_period} ({tz_abbr})"
            )
    else:
        start_time = start_dt.strftime("%d %b, %I:%M%p")
        end_time = end_dt.strftime("%d %b, %I:%M%p")
        start_time = start_time.replace(
            start_dt.strftime("%b"), start_dt.strftime("%b").capitalize()
        )
        end_time = end_time.replace(
            end_dt.strftime("%b"), end_dt.strftime("%b").capitalize()
        )
        event["formatted_time"] = f"{start_time} - {end_time} ({tz_abbr})"

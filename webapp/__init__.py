from webapp.app import app


# this is template filter that will sort a provided list of dicts
# by a key in order of values that are provided in `ordered_list`
@app.template_filter()
def sort_by_key_and_ordered_list(list_to_sort, obj_key, ordered_list):
    return sorted(
        list_to_sort, key=lambda item: ordered_list.index(item[obj_key])
    )

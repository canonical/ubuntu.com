"""update-release-12-04

Revision ID: 0fe2f3a871da
Revises: 88f1398da6c1
Create Date: 2021-01-15 15:15:19.145893

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = "0fe2f3a871da"
down_revision = "88f1398da6c1"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        "UPDATE release "
        "SET esm_expires='2019-04-30 00:00:00' "
        "WHERE version='12.04';"
    )


def downgrade():
    op.execute(
        "UPDATE release "
        "SET esm_expires='2021-04-30 00:00:00' "
        "WHERE version='12.04';"
    )
